"use client";
// 도구 > 자리 바꾸기: 자리표 + 시작(섞기) / 오른쪽 위 아이콘: 저장(확정)·인쇄·설정
// 인쇄를 누르면 미리보기 창 → 거기서 180도 회전(칠판 아래) 고르고 인쇄
// 설정(톱니)을 누르면 [책상 배치]·[조건]을 창(모달)으로 연다 (배치·조건은 자동 저장)
// '시작'은 섞어서 보여 주기만 하고, 오른쪽 위 저장 버튼을 눌러야 지금 자리로 확정된다(지난 자리는 기록으로).
// '지난 옆자리 피하기'는 마지막으로 저장한 자리를 기준으로 한다.
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { mutate } from "swr";
import { toast } from "react-hot-toast";
import { Cog6ToothIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useFetchData } from "@/hooks/useFetchData";
import { assignSeats, makeLayout, deskSeats, normalizeRules } from "@/util/seat/seatAlgorithm";
import { saveSeatSetup, confirmSeats } from "@/server-action/actions/seat/seat.action";
import SeatGrid from "./components/SeatGrid";
import PrintPreviewModal, { PRINT_PREVIEW_ID } from "./components/PrintPreviewModal";
import SeatSettingsModal, { SEAT_SETTINGS_ID } from "./components/SeatSettingsModal";

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

  const [modalId, setModalId] = useState(null); // 인쇄 미리보기 / 설정 창
  const [layout, setLayout] = useState(null);
  const [rules, setRules] = useState(EMPTY_RULES);
  const [draft, setDraft] = useState(null); // 방금 섞은 자리 (공개 애니메이션용)
  const [revealed, setRevealed] = useState(Infinity);
  const [printView, setPrintView] = useState("student"); // 인쇄 방향: student 칠판이 위 / teacher 180도 돌려 칠판이 아래
  const [printing, setPrinting] = useState(false); // 인쇄하는 동안만 화면 자리표를 printView로
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
    // 예전 '앞자리' → 그룹. 고정 자리는 옵션을 없앴으므로 비운다 (다음 저장 때 DB에서도 지워짐)
    setRules({ ...normalizeRules({ ...EMPTY_RULES, ...(plan?.rules ?? {}) }, initial), fixed: {} });
    if (!plan?.layout) setModalId(SEAT_SETTINGS_ID); // 처음이면 설정 창(책상 배치)부터
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

  // 화면 자리표를 고른 방향으로 바꾼 뒤 인쇄하고, 끝나면 되돌린다
  const onPrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };
  // 오른쪽 위 아이콘 버튼은 모두 같은 모양 (흰 배경 + 회색 선)
  const iconBtn = "btn btn-square btn-sm h-10 w-10 border-0 bg-white text-gray-600 hover:bg-orange-50";

  return (
    // 화면 높이만큼 → 아래로 스크롤하면 헤더가 올라가 자리표만 보인다 (타이머와 같은 방식)
    // 높이를 화면 높이로 '고정'(h-dvh)해야 자리표가 남은 높이에 맞춰진다 (min-h만 주면 칸이 아주 작아졌음)
    <div className="mx-auto flex h-dvh w-full max-w-[1600px] flex-col px-4 py-6 print:block print:h-auto sm:px-8">
      <div className="mb-4 flex items-center justify-end gap-3 print:hidden">
          <div className="flex items-center gap-1">
            <button
              type="button"
              title={unsaved ? "이 자리로 저장" : "저장할 새 자리가 없어요 ('시작'을 눌러 섞어 주세요)"}
              aria-label="자리 저장"
              className={`${iconBtn} relative`}
              disabled={!unsaved || busy || Boolean(hiddenSeats)}
              onClick={onSave}
            >
              <SaveIcon className="h-6 w-6" />
              {/* 저장 안 한 새 자리가 있으면 작은 주황 점 */}
              {unsaved && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-500" />}
            </button>
            <button type="button" title="인쇄 (미리보기)" aria-label="인쇄" className={iconBtn} disabled={!order.length || Boolean(hiddenSeats)} onClick={() => setModalId(PRINT_PREVIEW_ID)}>
              <PrinterIcon className="h-6 w-6" />
            </button>
            <button type="button" title="책상 배치·조건 설정" aria-label="설정" className={iconBtn} onClick={() => setModalId(SEAT_SETTINGS_ID)}>
              <Cog6ToothIcon className="h-6 w-6" />
            </button>
          </div>
      </div>

        <div className="flex min-h-0 flex-1 flex-col items-center gap-4">
          {/* 남은 화면(너비·높이)에 맞춰 자리표 크기를 정한다 (SeatGrid size="fit")
              인쇄할 때는 globals.css가 종이 한 장 크기로 바꿔 가로·세로 가운데에 놓는다 */}
          <div className="seat-print-area flex min-h-[240px] w-full flex-1 justify-center pb-2 [container-type:size]">
            <SeatGrid layout={layout} assignment={shown} students={byId} view={printing ? printView : "student"} hiddenSeats={hiddenSeats} size="fit" />
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

      <PrintPreviewModal
        modalId={modalId}
        setModalId={setModalId}
        layout={layout}
        assignment={shown}
        students={byId}
        printView={printView}
        setPrintView={setPrintView}
        onPrint={onPrint}
      />
      <SeatSettingsModal
        modalId={modalId}
        setModalId={setModalId}
        isNew={!plan?.layout}
        layout={layout}
        setLayout={editLayout}
        rules={rules}
        setRules={editRules}
        students={students}
      />
    </div>
  );
}
