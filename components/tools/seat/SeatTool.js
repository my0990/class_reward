"use client";
// 자리 바꾸기 화면 (선생님·비회원 공용): 자리표 + 시작(섞기) / 오른쪽 위 아이콘: 저장(확정)·인쇄·설정
// 인쇄를 누르면 미리보기 창 → 거기서 180도 회전(칠판 아래) 고르고 인쇄
// 설정(톱니)을 누르면 [책상 배치]·[조건]을 창(모달)으로 연다 (배치·조건은 자동 저장)
// '시작'은 섞어서 보여 주기만 하고, 오른쪽 위 저장 버튼을 눌러야 지금 자리로 확정된다(지난 자리는 기록으로).
// '지난 옆자리 피하기'는 마지막으로 저장한 자리를 기준으로 한다.
import { useEffect, useMemo, useRef, useState } from "react";
import KkyulLogo from "@/components/tools/KkyulLogo";
import { labelOf } from "./studentLabel";
import { toast } from "react-hot-toast";
import { Cog6ToothIcon, PrinterIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from "@heroicons/react/24/outline";
import { assignSeats, makeLayout, deskSeats, normalizeRules, violations } from "@/util/seat/seatAlgorithm";
import { cleanRules } from "@/util/seat/seatPlan";
import SeatGrid from "./SeatGrid";
import PrintPreviewModal, { PRINT_PREVIEW_ID } from "./PrintPreviewModal";
import SeatSettingsModal, { SEAT_SETTINGS_ID } from "./SeatSettingsModal";

// 저장(디스크) 아이콘
function SaveIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M7 3v5h8V3M7 21v-7h10v7" />
    </svg>
  );
}

// 처음(저장된 배치 없음) 기본 배치: 4줄 × 8칸, 3번째·6번째 칸은 통로 → 책상 둘 | 통로 | 둘 | 통로 | 둘
function defaultLayout() {
  const layout = makeLayout(4, 8);
  for (const row of layout.desks) row[2] = row[5] = false;
  return layout;
}

const EMPTY_RULES = { fixed: {}, groups: [], apart: [], avoidPrevPartner: true, excluded: [] };
const REVEAL_MS = 90; // 섞을 때 한 자리씩 공개하는 간격

// 선생님 도구(/teacher/dashboard/[id]/tools/seat)와 비회원 도구(/tools/seat)가 같이 쓴다.
// store: 학생 명단·저장 방법 (useClassSeatStore = 서버 / useGuestSeatStore = 이 브라우저)
export default function SeatTool({ store }) {
  const { plan, students: studentList, isLoading, isError, guest } = store;

  const [modalId, setModalId] = useState(null); // 인쇄 미리보기 / 설정 창
  const [settingsTab, setSettingsTab] = useState("layout"); // 설정 창 탭 (창을 닫았다 열어도 유지)
  const openSettings = (tab) => {
    if (tab) setSettingsTab(tab);
    setModalId(SEAT_SETTINGS_ID);
  };
  const [layout, setLayout] = useState(null);
  const [rules, setRules] = useState(EMPTY_RULES);
  const [draft, setDraft] = useState(null); // 방금 섞은 자리 (공개 애니메이션용)
  const [revealed, setRevealed] = useState(Infinity);
  const [printView, setPrintView] = useState("student"); // 인쇄 방향: student 칠판이 위 / teacher 180도 돌려 칠판이 아래
  const [printing, setPrinting] = useState(false); // 인쇄하는 동안만 화면 자리표를 printView로
  const [printTarget, setPrintTarget] = useState(null); // 기록에서 인쇄할 때 그 기록 { layout, assignment, label } (없으면 지금 화면 자리)
  const [savedDraft, setSavedDraft] = useState(null); // 마지막으로 저장한 draft (같은 결과를 두 번 저장하지 않게)
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState(null); // 손으로 자리 바꾸기: 먼저 누른 자리
  const shuffleBase = useRef(null); // 섞을 때 기준이었던 지난 자리 ('지난 옆자리' 경고도 이것과 비교)
  const shuffleRules = useRef(null); // 섞을 때 쓴 조건 (왼쪽을 눌러 고정 없이 섞었으면 고정 빼고 경고)
  const timer = useRef(null);

  const students = useMemo(() => studentList ?? [], [studentList]);
  const byId = useMemo(() => Object.fromEntries(students.map((s) => [s.userId, s])), [students]);

  // 처음 불러올 때: 저장된 배치가 없으면 기본 배치(4×8, 통로 2줄)
  useEffect(() => {
    if (layout || plan === undefined || !studentList) return;
    const initial = plan?.layout ?? defaultLayout();
    setLayout(initial);
    // 예전 '앞자리' → 그룹
    setRules(normalizeRules({ ...EMPTY_RULES, ...(plan?.rules ?? {}) }, initial));
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
    const res = await store.saveSetup(latest.current).catch(() => null);
    if (!res?.result) {
      dirty.current = true;
      toast.error(res?.message || "배치·조건을 저장하지 못했습니다.");
      return;
    }
    store.refresh();
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
    if (next.excluded !== rules.excluded) setDraft(null); // 참여 학생이 바뀌면 섞은 결과는 다시
    setRules(next);
  };

  // 전체 화면 (타이머와 같은 방식: 자리표 화면만 꽉 채움, Esc로 끝)
  // 훅이라 아래 '불러오는 중' return보다 위에 있어야 한다 (순서가 바뀌면 React 오류)
  const wrapRef = useRef(null);
  const [isFull, setIsFull] = useState(false);
  useEffect(() => {
    const onChange = () => setIsFull(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  if (isLoading || !layout) return <div className="p-8">불러오는 중...</div>;
  if (isError) return <div className="p-8">데이터를 불러오지 못했습니다.</div>;

  // 처음 들어오면 이름 없이 빈 책상만 → '시작'을 눌러야 이름이 나온다 (지난 자리는 저장만 되어 있음)
  const shown = draft ?? {};
  const order = deskSeats(layout).filter((s) => shown[s]);
  const hiddenSeats = draft && revealed < order.length ? new Set(order.slice(revealed)) : null;

  const reveal = (assignment) => {
    clearInterval(timer.current);
    setPicked(null);
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
    const res = await store.saveSetup({ layout, rules });
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
  // '시작' 버튼: 오른쪽 절반을 누르면 자리 고정 포함, 왼쪽 절반을 누르면 자리 고정 없이 섞는다 (화면에는 표시 안 함)
  // 키보드(Enter·Space)로 누르면 위치가 없으므로 고정 포함
  const onStartClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const byPointer = e.detail > 0 && e.clientX > 0;
    onStart({ useFixed: !byPointer || e.clientX >= rect.left + rect.width / 2 });
  };
  const onStart = ({ useFixed = true } = {}) => {
    if (students.length === 0) {
      toast.error("학생 명단을 먼저 넣어 주세요.");
      return openSettings("students");
    }
    const excluded = new Set(guest ? [] : rules.excluded ?? []); // 비회원은 '제외'가 없다 (명단에서 지우면 됨)
    shuffleBase.current = plan?.current?.assignment ?? null;
    shuffleRules.current = useFixed ? rules : { ...rules, fixed: {} };
    const res = assignSeats(students.map((s) => s.userId).filter((u) => !excluded.has(u)), layout, shuffleRules.current, {
      prevAssignment: shuffleBase.current, // 마지막으로 저장한 자리
      nameOf: labelOf(byId),
    });
    if (!res.ok) return toast.error(res.reason);
    reveal(res.assignment);
  };

  // 저장: 지금 보이는 자리를 확정 (이전 자리는 기록으로)
  const unsaved = Boolean(draft) && draft !== savedDraft;

  // 손으로 자리 바꾸기: 섞은 뒤(공개가 끝나면) 자리를 하나 누르고 다른 자리를 누르면 서로 바뀐다. 빈 책상이면 그리로 옮김
  const nameOf = labelOf(byId);
  const canEdit = Boolean(draft) && !hiddenSeats && !busy;
  const onSeatClick = (sid) => {
    if (!picked) return draft[sid] && setPicked(sid);
    if (picked === sid) return setPicked(null);
    const next = { ...draft };
    const a = next[picked];
    const b = next[sid];
    if (b) next[picked] = b;
    else delete next[picked];
    next[sid] = a;
    setDraft(next);
    setPicked(null);
  };
  // 손으로 바꾼 결과가 조건과 맞지 않으면 알려 준다 (막지는 않음). 자리 고정은 학생들이 보면 안 되므로 경고하지 않는다
  const warnings = draft && !hiddenSeats ? violations(draft, layout, { ...(shuffleRules.current ?? rules), fixed: {} }, shuffleBase.current, { nameOf }) : [];
  const onSave = () =>
    run(async () => {
      await saveSetup(); // 쓴 배치·조건도 함께 저장
      const saved = await store.confirm(draft);
      if (!saved?.result) throw new Error(saved?.message);
      setSavedDraft(draft);
      await store.refresh();
      toast.success("이 자리로 저장했어요.");
    });

  // 기록 지우기 (설정 창 > 기록)
  const onDeleteRecord = (at) =>
    run(async () => {
      const res = await store.deleteRecord(at);
      if (!res?.result) throw new Error(res?.message);
      await store.refresh();
      toast.success(res.message);
    });

  // 화면 자리표를 고른 방향으로 바꾼 뒤 인쇄하고, 끝나면 되돌린다
  const onPrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
      setPrintTarget(null);
    }, 100);
  };
  // 기록(설정 창 > 기록)에서 '인쇄' → 그 기록으로 인쇄 미리보기
  const onPrintRecord = (record) => {
    setPrintTarget(record);
    setModalId(PRINT_PREVIEW_ID);
  };
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else wrapRef.current?.requestFullscreen?.().catch(() => toast.error("이 브라우저에서는 전체 화면을 쓸 수 없어요."));
  };

  // 오른쪽 위 아이콘 버튼은 모두 같은 모양 (흰 배경 + 회색 선)
  const iconBtn = "btn btn-square btn-sm h-10 w-10 border-0 bg-white text-gray-600 hover:bg-orange-50";

  return (
    // 화면 높이만큼 → 아래로 스크롤하면 헤더가 올라가 자리표만 보인다 (타이머와 같은 방식)
    // 높이를 화면 높이로 '고정'(h-dvh)해야 자리표가 남은 높이에 맞춰진다 (min-h만 주면 칸이 아주 작아졌음)
    <div
      ref={wrapRef}
      className={`mx-auto flex h-dvh w-full flex-col px-4 py-6 print:block print:h-auto sm:px-8 ${isFull ? "max-w-none bg-white" : "max-w-[1600px]"}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
          {/* 비회원: 왼쪽 위 뀰 아이콘 (첫 화면으로) */}
          {guest ? (
            <KkyulLogo />
          ) : (
            <span />
          )}
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
            <button type="button" title="인쇄 (미리보기)" aria-label="인쇄" className={iconBtn} disabled={!order.length || Boolean(hiddenSeats)} onClick={() => {
              setPrintTarget(null);
              setModalId(PRINT_PREVIEW_ID);
            }}>
              <PrinterIcon className="h-6 w-6" />
            </button>
            <button type="button" title="책상 배치·조건 설정" aria-label="설정" className={iconBtn} onClick={() => openSettings()}>
              <Cog6ToothIcon className="h-6 w-6" />
            </button>
            <button type="button" title={isFull ? "전체 화면 끝내기" : "전체 화면"} aria-label={isFull ? "전체 화면 끝내기" : "전체 화면"} className={iconBtn} onClick={toggleFull}>
              {isFull ? <ArrowsPointingInIcon className="h-6 w-6" /> : <ArrowsPointingOutIcon className="h-6 w-6" />}
            </button>
          </div>
      </div>

        <div className="flex min-h-0 flex-1 flex-col items-center gap-4">
          {/* 남은 화면(너비·높이)에 맞춰 자리표 크기를 정한다 (SeatGrid size="fit")
              인쇄할 때는 globals.css가 종이 한 장 크기로 바꿔 가로·세로 가운데에 놓는다 */}
          <div className="seat-print-area flex min-h-[240px] w-full flex-1 justify-center pb-2 [container-type:size]">
            {/* 인쇄하는 동안: 기록에서 고른 자리가 있으면 그 자리로 */}
            <SeatGrid
              layout={printing && printTarget ? printTarget.layout : layout}
              assignment={printing && printTarget ? printTarget.assignment : shown}
              students={byId}
              view={printing ? printView : "student"}
              hiddenSeats={printing && printTarget ? null : hiddenSeats}
              size="fit"
              onSeatClick={canEdit && !printing ? onSeatClick : undefined}
              selected={printing ? null : picked}
            />
          </div>
          {/* 손으로 바꾸기 안내 · 조건 경고 */}
          {canEdit && (
            <div className="-mt-2 flex flex-col items-center gap-1 text-center text-sm print:hidden">
              <p className="text-gray-500">
                {picked ? `${nameOf(draft[picked])} 학생을 옮길 자리를 누르세요 (같은 자리를 다시 누르면 취소)` : "✋ 자리를 하나 누르고 다른 자리를 누르면 서로 바뀌어요"}
              </p>
              {warnings.length > 0 && (
                <p className="font-semibold text-amber-600">
                  ⚠️ 조건과 맞지 않아요: {warnings.slice(0, 3).join(" · ")}
                  {warnings.length > 3 ? ` 외 ${warnings.length - 3}개` : ""}
                </p>
              )}
            </div>
          )}
          <div className="print:hidden">
            <button
              type="button"
              className="btn btn-lg border-0 bg-orange-500 px-16 text-xl text-white hover:bg-orange-600"
              disabled={busy || Boolean(hiddenSeats)}
              onClick={onStartClick}
            >
              시작
            </button>
          </div>
        </div>

      <PrintPreviewModal
        modalId={modalId}
        setModalId={setModalId}
        layout={printTarget?.layout ?? layout}
        assignment={printTarget?.assignment ?? shown}
        students={byId}
        printView={printView}
        setPrintView={setPrintView}
        onPrint={onPrint}
        label={printTarget?.label}
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
        plan={plan}
        onDeleteRecord={onDeleteRecord}
        onPrintRecord={onPrintRecord}
        busy={busy}
        tab={settingsTab}
        setTab={setSettingsTab}
        // 비회원: [학생] 탭에서 명단을 직접 넣는다 (바꾸면 없어진 번호는 조건에서도 뺌)
        onRosterSave={
          guest
            ? (list) => {
                if (!store.setRoster(list)) toast.error("이 브라우저에 저장하지 못했어요.");
                dirty.current = true;
                setRules((r) => cleanRules(r, layout, new Set(list.map((x) => x.userId))));
                setDraft(null);
                toast.success(`명단 ${list.length}명을 반영했어요.`);
              }
            : null
        }
      />
    </div>
  );
}
