"use client";
// 도구 > 자리 바꾸기: [자리 바꾸기] 섞기·확정·인쇄 / [교실 배치] / [조건]
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
  const [draft, setDraft] = useState(null); // 섞었지만 아직 확정 안 한 자리
  const [revealed, setRevealed] = useState(Infinity);
  const [view, setView] = useState("student");
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);

  const students = useMemo(() => (studentList ?? []).filter((s) => s.role !== "teacher"), [studentList]);
  const byId = useMemo(() => Object.fromEntries(students.map((s) => [s.userId, s])), [students]);

  // 처음 불러올 때: 저장된 배치가 없으면 학생 수에 맞춘 6칸 배치
  useEffect(() => {
    if (layout || plan === undefined || !studentList) return;
    setLayout(plan?.layout ?? makeLayout(Math.max(1, Math.ceil(students.length / 6)), 6));
    setRules({ ...EMPTY_RULES, ...(plan?.rules ?? {}) });
    if (!plan?.layout) setTab("layout"); // 처음이면 교실 배치부터 (표 만들기처럼 크기 고르기)
  }, [plan, studentList, students.length, layout]);

  useEffect(() => () => clearInterval(timer.current), []);

  if (l1 || l2 || !layout) return <div className="p-8">불러오는 중...</div>;
  if (e1 || e2) return <div className="p-8">데이터를 불러오지 못했습니다.</div>;

  const current = plan?.current?.assignment ?? null;
  const shown = draft ?? current ?? {};
  const order = deskSeats(layout).filter((s) => shown[s]);
  const hiddenSeats = draft && revealed < order.length ? new Set(order.slice(revealed)) : null;

  const shuffle = (animate) => {
    clearInterval(timer.current);
    const res = assignSeats(students.map((s) => s.userId), layout, rules, { prevAssignment: current });
    if (!res.ok) {
      toast.error(res.reason);
      return;
    }
    setDraft(res.assignment);
    if (!animate) {
      setRevealed(Infinity);
      return;
    }
    setRevealed(0);
    let n = 0;
    timer.current = setInterval(() => {
      n += 1;
      setRevealed(n);
      if (n >= Object.keys(res.assignment).length) clearInterval(timer.current);
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

  const onConfirm = () =>
    run(async () => {
      await saveSetup(); // 확정할 때 쓴 배치·조건도 함께 저장
      const res = await confirmSeats({ classId, assignment: draft });
      if (!res?.result) throw new Error(res?.message);
      await mutate(planKey);
      setDraft(null);
      toast.success(res.message);
    });

  const tabs = [
    ["seat", "자리 바꾸기"],
    ["layout", "교실 배치"],
    ["rules", "조건"],
  ];
  const btn = "btn btn-sm border-0";

  return (
    <div className="page-width py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div role="tablist" className="tabs tabs-boxed bg-orange-100">
          {tabs.map(([key, label]) => (
            <button key={key} type="button" role="tab" className={`tab ${tab === key ? "tab-active !bg-orange-500 !text-white" : ""}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>
        {tab !== "seat" && (
          <button type="button" className={`${btn} bg-orange-500 text-white`} disabled={busy} onClick={onSaveSetup}>
            {busy ? "저장 중..." : "배치·조건 저장"}
          </button>
        )}
      </div>

      {tab === "layout" && <LayoutEditor isNew={!plan?.layout} layout={layout} setLayout={(l) => { setLayout(l); setDraft(null); }} studentCount={students.length} />}
      {tab === "rules" && <RulesEditor rules={rules} setRules={setRules} layout={layout} students={students} />}

      {tab === "seat" && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2 print:hidden">
            <button type="button" className={`${btn} bg-orange-500 text-white`} onClick={() => shuffle(true)}>🎲 섞기</button>
            <button type="button" className={`${btn} bg-orange-100 text-orange-700`} onClick={() => shuffle(false)}>바로 보기</button>
            <button type="button" className={`${btn} bg-green-600 text-white`} disabled={!draft || busy || Boolean(hiddenSeats)} onClick={onConfirm}>
              {busy ? "저장 중..." : "이대로 확정"}
            </button>
            <button type="button" className={`${btn} bg-white text-gray-600`} onClick={() => setView((v) => (v === "student" ? "teacher" : "student"))}>
              {view === "student" ? "학생 시점 (교탁 위)" : "교사 시점 (교탁 아래)"} ↔
            </button>
            <button type="button" className={`${btn} bg-white text-gray-600`} disabled={!order.length} onClick={() => window.print()}>🖨 인쇄</button>
          </div>
          <p className="text-sm text-gray-500 print:hidden">
            {draft
              ? "섞은 결과입니다. '이대로 확정'을 눌러야 저장됩니다."
              : current
                ? `지금 자리 (${new Date(plan.current.confirmedAt).toLocaleDateString("ko-KR")} 확정)`
                : "아직 확정한 자리가 없습니다. '섞기'를 눌러 보세요."}
          </p>
          <div className="seat-print-area max-w-full overflow-x-auto pb-2">
            <SeatGrid layout={layout} assignment={shown} students={byId} view={view} hiddenSeats={hiddenSeats} />
          </div>
        </div>
      )}
    </div>
  );
}
