"use client";
// 도구 > 자리 바꾸기: [자리 바꾸기] 시작(섞기+자동 저장)·인쇄 / [교실 배치] / [조건]
// '시작'을 누르면 바로 저장된다. 이 화면에 들어온 뒤 두 번째부터는 다시 섞기로 보고
// 기록(history)에 남기지 않으며, '지난 짝 피하기'도 들어오기 전 자리를 기준으로 한다.
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { mutate } from "swr";
import { toast } from "react-hot-toast";
import { useFetchData } from "@/hooks/useFetchData";
import { assignSeats, makeLayout, deskSeats } from "@/util/seat/seatAlgorithm";
import { saveSeatSetup, confirmSeats } from "@/server-action/actions/seat/seat.action";
import SeatGrid from "./components/SeatGrid";
import LayoutEditor from "./components/LayoutEditor";
import RulesEditor from "./components/RulesEditor";

const EMPTY_RULES = { fixed: {}, front: { userIds: [], rows: 1 }, apart: [], avoidPrevPartner: true };
const REVEAL_MS = 90; // 섞을 때 한 자리씩 공개하는 간격

export default function SeatPage() {
  const { id: classId } = useParams();
  const planKey = `/api/seat/${classId}`;
  const { data: plan, isLoading: l1, isError: e1 } = useFetchData(planKey);
  const { data: studentList, isLoading: l2, isError: e2 } = useFetchData(`/api/students/${classId}`);

  const [tab, setTab] = useState("seat");
  const [layout, setLayout] = useState(null);
  const [rules, setRules] = useState(EMPTY_RULES);
  const [draft, setDraft] = useState(null); // 방금 섞은 자리 (공개 애니메이션용)
  const [revealed, setRevealed] = useState(Infinity);
  const view = "student"; // 학생 시점 (교탁이 위)
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);
  const baseRef = useRef(undefined); // 이 화면에 들어올 때의 자리 (다시 섞어도 이걸 기준으로)
  const shuffledOnce = useRef(false); // 이 화면에서 이미 한 번 섞었나 (두 번째부터는 기록에 안 남김)

  const students = useMemo(() => (studentList ?? []).filter((s) => s.role !== "teacher"), [studentList]);
  const byId = useMemo(() => Object.fromEntries(students.map((s) => [s.userId, s])), [students]);

  // 처음 불러올 때: 저장된 배치가 없으면 학생 수에 맞춘 6칸 배치
  useEffect(() => {
    if (layout || plan === undefined || !studentList) return;
    setLayout(plan?.layout ?? makeLayout(Math.max(1, Math.ceil(students.length / 6)), 6));
    setRules({ ...EMPTY_RULES, ...(plan?.rules ?? {}) });
    if (!plan?.layout) setTab("layout"); // 처음이면 교실 배치부터 (표 만들기처럼 크기 고르기)
    baseRef.current = plan?.current?.assignment ?? null;
  }, [plan, studentList, students.length, layout]);

  useEffect(() => () => clearInterval(timer.current), []);

  if (l1 || l2 || !layout) return <div className="p-8">불러오는 중...</div>;
  if (e1 || e2) return <div className="p-8">데이터를 불러오지 못했습니다.</div>;

  const current = plan?.current?.assignment ?? null;
  const shown = draft ?? current ?? {};
  const order = deskSeats(layout).filter((s) => shown[s]);
  const hiddenSeats = draft && revealed < order.length ? new Set(order.slice(revealed)) : null;

  const reveal = (assignment) => {
    clearInterval(timer.current);
    setDraft(assignment);
    setRevealed(0);
    let n = 0;
    timer.current = setInterval(() => {
      n += 1;
      setRevealed(n);
      if (n >= Object.keys(assignment).length) clearInterval(timer.current);
    }, REVEAL_MS);
  };

  const saveSetup = async () => {
    const res = await saveSeatSetup({ classId, layout, rules });
    if (!res?.result) throw new Error(res?.message || "저장하지 못했습니다.");
    setRules(res.data.rules);
  };

  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast.error(err.message || "처리하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const onSaveSetup = () =>
    run(async () => {
      await saveSetup();
      await mutate(planKey);
      toast.success("저장했습니다.");
    });

  // 시작: 섞고 → 바로 저장 → 한 자리씩 공개
  const onStart = () =>
    run(async () => {
      const res = assignSeats(students.map((s) => s.userId), layout, rules, { prevAssignment: baseRef.current });
      if (!res.ok) throw new Error(res.reason);
      await saveSetup(); // 쓴 배치·조건도 함께 저장
      const saved = await confirmSeats({ classId, assignment: res.assignment, replace: shuffledOnce.current });
      if (!saved?.result) throw new Error(saved?.message);
      shuffledOnce.current = true;
      reveal(res.assignment);
      await mutate(planKey);
    });

  const tabs = [
    ["seat", "자리 바꾸기"],
    ["layout", "교실 배치"],
    ["rules", "조건"],
  ];
  const btn = "btn btn-sm border-0";

  return (
    // 최소 화면 높이만큼 → 아래로 스크롤하면 헤더가 올라가 자리표만 보인다 (타이머와 같은 방식)
    <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] flex-col px-4 py-6 print:block print:min-h-0 sm:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div role="tablist" className="tabs tabs-boxed bg-orange-100">
          {tabs.map(([key, label]) => (
            <button key={key} type="button" role="tab" className={`tab ${tab === key ? "tab-active !bg-orange-500 !text-white" : ""}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>
        {tab !== "seat" ? (
          <button type="button" className={`${btn} bg-orange-500 text-white`} disabled={busy} onClick={onSaveSetup}>
            {busy ? "저장 중..." : "배치·조건 저장"}
          </button>
        ) : (
          <button type="button" className={`${btn} bg-white text-gray-600`} disabled={!order.length || Boolean(hiddenSeats)} onClick={() => window.print()}>
            🖨 인쇄
          </button>
        )}
      </div>

      {tab === "layout" && <LayoutEditor isNew={!plan?.layout} layout={layout} setLayout={(l) => { setLayout(l); setDraft(null); }} studentCount={students.length} />}
      {tab === "rules" && <RulesEditor rules={rules} setRules={setRules} layout={layout} students={students} />}

      {tab === "seat" && (
        <div className="flex min-h-0 flex-1 flex-col items-center gap-4">
          <p className="text-base text-gray-500 print:hidden">
            {current
              ? `지금 자리 (${new Date(plan.current.confirmedAt).toLocaleDateString("ko-KR")} 저장)`
              : "아직 정한 자리가 없습니다. 아래 '시작'을 눌러 보세요."}
          </p>
          {/* 남은 화면(너비·높이)에 맞춰 자리표 크기를 정한다 (SeatGrid size="fit")
              인쇄할 때는 높이 기준이 없어지므로 inline-size로 바꾼다 (cqh → 인쇄 페이지 높이) */}
          <div className="seat-print-area flex min-h-[240px] w-full flex-1 justify-center pb-2 [container-type:size] print:[container-type:inline-size]">
            <SeatGrid layout={layout} assignment={shown} students={byId} view={view} hiddenSeats={hiddenSeats} size="fit" />
          </div>
          <div className="print:hidden">
            <button
              type="button"
              className="btn btn-lg border-0 bg-orange-500 px-16 text-xl text-white hover:bg-orange-600"
              disabled={busy || Boolean(hiddenSeats)}
              onClick={onStart}
            >
              {busy ? "섞는 중..." : "시작"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
