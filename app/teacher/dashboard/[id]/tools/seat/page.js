"use client";
// 도구 > 자리 바꾸기: [자리 바꾸기] 시작(섞기)·저장(확정)·인쇄·180도 회전 / [책상 배치] / [조건] (배치·조건은 자동 저장)
// '시작'은 섞어서 보여 주기만 하고, 오른쪽 위 저장 버튼을 눌러야 지금 자리로 확정된다(지난 자리는 기록으로).
// '지난 옆자리 피하기'는 마지막으로 저장한 자리를 기준으로 한다.
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { mutate } from "swr";
import { toast } from "react-hot-toast";
import { ArrowPathIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useFetchData } from "@/hooks/useFetchData";
import { assignSeats, makeLayout, deskSeats, normalizeRules } from "@/util/seat/seatAlgorithm";
import { saveSeatSetup, confirmSeats } from "@/server-action/actions/seat/seat.action";
import SeatGrid from "./components/SeatGrid";
import LayoutEditor from "./components/LayoutEditor";
import RulesEditor from "./components/RulesEditor";

// 저장(디스크) 아이콘
function SaveIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M7 3v5h8V3M7 21v-7h10v7" />
    </svg>
  );
}

const EMPTY_RULES = { fixed: {}, groups: [], apart: [], avoidPrevPartner: true };
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
  const [view, setView] = useState("student"); // student: 칠판이 위 / teacher: 180도 돌려 칠판이 아래
  const [savedDraft, setSavedDraft] = useState(null); // 마지막으로 저장한 draft (같은 결과를 두 번 저장하지 않게)
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);

  const students = useMemo(() => (studentList ?? []).filter((s) => s.role !== "teacher"), [studentList]);
  const byId = useMemo(() => Object.fromEntries(students.map((s) => [s.userId, s])), [students]);

  // 처음 불러올 때: 저장된 배치가 없으면 학생 수에 맞춘 6칸 배치
  useEffect(() => {
    if (layout || plan === undefined || !studentList) return;
    const initial = plan?.layout ?? makeLayout(Math.max(1, Math.ceil(students.length / 6)), 6);
    setLayout(initial);
    setRules(normalizeRules({ ...EMPTY_RULES, ...(plan?.rules ?? {}) }, initial)); // 예전 '앞자리' → 그룹
    if (!plan?.layout) setTab("layout"); // 처음이면 교실 배치부터 (표 만들기처럼 크기 고르기)
  }, [plan, studentList, students.length, layout]);

  useEffect(() => () => clearInterval(timer.current), []);

  // 교실 배치·조건은 바꾸면 0.8초 뒤 자동 저장 (저장 버튼 없음). 화면을 나갈 때 남은 것도 저장
  const dirty = useRef(false);
  const latest = useRef({ layout, rules });
  latest.current = { layout, rules };
  const autoSave = useRef(null);
  autoSave.current = async () => {
    if (!dirty.current || !latest.current.layout) return;
    dirty.current = false;
    const res = await saveSeatSetup({ classId, ...latest.current }).catch(() => null);
    if (!res?.result) {
      dirty.current = true;
      toast.error(res?.message || "배치·조건을 저장하지 못했습니다.");
      return;
    }
    mutate(planKey);
  };
  useEffect(() => {
    if (!dirty.current) return undefined;
    const t = setTimeout(() => autoSave.current(), 800);
    return () => clearTimeout(t);
  }, [layout, rules]);
  useEffect(() => () => void autoSave.current(), []);

  // 섞고 저장하지 않은 채 새로고침·창 닫기를 하면 한 번 물어본다
  useEffect(() => {
    if (!draft || draft === savedDraft) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft, savedDraft]);
  const editLayout = (l) => {
    dirty.current = true;
    setLayout(l);
    setDraft(null);
  };
  const editRules = (next) => {
    dirty.current = true;
    setRules(next);
  };

  if (l1 || l2 || !layout) return <div className="p-8">불러오는 중...</div>;
  if (e1 || e2) return <div className="p-8">데이터를 불러오지 못했습니다.</div>;

  // 처음 들어오면 이름 없이 빈 책상만 → '시작'을 눌러야 이름이 나온다 (지난 자리는 저장만 되어 있음)
  const shown = draft ?? {};
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
    dirty.current = false; // 자동 저장할 것도 같이 저장됨
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

  // 시작: 섞어서 한 자리씩 공개 (저장은 아직 안 함)
  const onStart = () => {
    const res = assignSeats(students.map((s) => s.userId), layout, rules, {
      prevAssignment: plan?.current?.assignment ?? null, // 마지막으로 저장한 자리
      nameOf: (u) => (byId[u] ? `${byId[u].classNumber}번 ${byId[u].profileNickname}` : u),
    });
    if (!res.ok) return toast.error(res.reason);
    reveal(res.assignment);
  };

  // 저장: 지금 보이는 자리를 확정 (이전 자리는 기록으로)
  const unsaved = Boolean(draft) && draft !== savedDraft;
  const onSave = () =>
    run(async () => {
      await saveSetup(); // 쓴 배치·조건도 함께 저장
      const saved = await confirmSeats({ classId, assignment: draft });
      if (!saved?.result) throw new Error(saved?.message);
      setSavedDraft(draft);
      await mutate(planKey);
      toast.success("이 자리로 저장했어요.");
    });

  const tabs = [
    ["seat", "자리 바꾸기"],
    ["layout", "책상 배치"],
    ["rules", "조건"],
  ];
  // 배경·글자색은 한 가지만 붙인다 (bg-white와 bg-orange-500을 같이 붙이면 CSS 순서로 흰색이 이겨 아이콘이 안 보였음)
  const iconBase = "btn btn-square btn-sm h-10 w-10 border-0";
  const iconBtn = `${iconBase} bg-white text-gray-600 hover:bg-orange-50`;

  return (
    // 화면 높이만큼 → 아래로 스크롤하면 헤더가 올라가 자리표만 보인다 (타이머와 같은 방식)
    // 자리표 탭은 높이를 화면 높이로 '고정'(h-dvh)해야 자리표가 남은 높이에 맞춰진다.
    // min-h만 주면 높이가 정해지지 않은 것으로 봐서 칸이 아주 작아졌음. 다른 탭은 내용만큼 늘어나게 min-h.
    <div className={`mx-auto flex w-full max-w-[1600px] flex-col px-4 py-6 print:block print:h-auto print:min-h-0 sm:px-8 ${tab === "seat" ? "h-dvh" : "min-h-dvh"}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div role="tablist" className="tabs tabs-boxed bg-orange-100">
          {tabs.map(([key, label]) => (
            <button key={key} type="button" role="tab" className={`tab ${tab === key ? "tab-active !bg-orange-500 !text-white" : ""}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>
        {tab === "seat" && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title={unsaved ? "이 자리로 저장" : "저장할 새 자리가 없어요 ('시작'을 눌러 섞어 주세요)"}
              aria-label="자리 저장"
              className={unsaved ? `${iconBase} bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300 disabled:text-white` : iconBtn}
              disabled={!unsaved || busy || Boolean(hiddenSeats)}
              onClick={onSave}
            >
              <SaveIcon className="h-6 w-6" />
            </button>
            <button type="button" title="인쇄" aria-label="인쇄" className={iconBtn} disabled={!order.length || Boolean(hiddenSeats)} onClick={() => window.print()}>
              <PrinterIcon className="h-6 w-6" />
            </button>
            <button
              type="button"
              title={view === "student" ? "180도 회전 (칠판이 아래로)" : "180도 회전 (칠판이 위로)"}
              aria-label="180도 회전"
              className={view === "teacher" ? `${iconBase} bg-orange-100 text-orange-700 hover:bg-orange-200` : iconBtn}
              onClick={() => setView((v) => (v === "student" ? "teacher" : "student"))}
            >
              <ArrowPathIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      {tab === "layout" && <LayoutEditor isNew={!plan?.layout} layout={layout} setLayout={editLayout} studentCount={students.length} />}
      {tab === "rules" && <RulesEditor rules={rules} setRules={editRules} layout={layout} students={students} />}

      {tab === "seat" && (
        <div className="flex min-h-0 flex-1 flex-col items-center gap-4">
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
              시작
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
