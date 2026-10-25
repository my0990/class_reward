"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowPathIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  Cog6ToothIcon,
  MicrophoneIcon,
  PauseIcon,
  PencilSquareIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { useCountdown } from "@/hooks/timer/useCountdown";
import { useNoiseMeter } from "@/hooks/timer/useNoiseMeter";
import { useTimerSettings } from "@/hooks/timer/useTimerSettings";
import { NOISE_COLORS, TIMER_THEMES, noiseLevel } from "@/util/timer/timerMath";
import { playCountdown, playDone, playLoud, unlockSound, setSoundVolume } from "@/util/timer/sounds";
import TimeDisplay from "./components/TimeDisplay";
import CircleTimer from "./components/CircleTimer";
import SettingsModal from "./components/SettingsModal";
import { BIG_CURSOR_CSS, useBigCursor } from "./components/useBigCursor";

// 판서판은 열 때만 내려받는다
const Board = dynamic(() => import("./components/Board"), {
  ssr: false,
  loading: () => <div className="h-full bg-[#264941]" />,
});

const PRESETS = [1, 3, 5, 10];
const BOARD_OPEN_PCT = 45;

export default function TimerPage() {
  const { id } = useParams();
  const [settings, update] = useTimerSettings();
  const [modalId, setModalId] = useState(null);
  const [count, setCount] = useState(0);
  const [boardPct, setBoardPct] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const wrapRef = useRef(null);
  const cursor = useBigCursor({ highlight: settings.pointerHighlight });

  const timer = useCountdown({
    initialMs: 0, // 처음엔 0분
    storageKey: `kkyul:timer-state:${id}`, // 다른 화면에 갔다 와도 이어서 (이 탭에서만)
    onSecond: (sec) => sec <= 3 && playCountdown(),
    onDone: () => playDone(settings.doneSound, settings.doneRepeat),
  });

  // 알림음 크기 설정 반영
  useEffect(() => setSoundVolume(settings.volume), [settings.volume]);

  const muteRef = useRef(settings.muteAlert);
  muteRef.current = settings.muteAlert;
  const meter = useNoiseMeter({
    sensitivity: settings.sensitivity,
    onLoud: () => {
      setCount((c) => c + 1);
      if (!muteRef.current) playLoud();
    },
  });

  useEffect(() => {
    const onChange = () => setIsFull(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const running = timer.status === "running";
  const toggleRun = useCallback(() => {
    unlockSound();
    if (running) timer.pause();
    else timer.start();
  }, [running, timer.pause, timer.start]);

  // 스페이스바로 시작·일시정지 (입력 중일 때는 제외)
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== "Space" || modalId) return;
      const t = e.target;
      if (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(t.tagName)) return;
      e.preventDefault();
      toggleRun();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleRun, modalId]);

  const toggleMeter = async () => {
    if (meter.active) return meter.stop();
    try {
      unlockSound();
      await meter.start();
    } catch {
      toast.error("마이크를 쓸 수 없어요. 브라우저 주소창의 마이크 권한을 확인해 주세요.");
    }
  };

  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapRef.current?.requestFullscreen?.();
  };

  // 가운데 막대를 끌어 판서판 너비 조절
  // 오른쪽 끝까지 밀면 판서판 닫힘, 왼쪽 끝까지 밀면 판서판만 보임(시계 숨김)
  const [dragging, setDragging] = useState(false);
  const onDividerDown = (e) => {
    e.preventDefault();
    setDragging(true);
    const rect = wrapRef.current.getBoundingClientRect();
    const move = (ev) => {
      const pct = ((rect.right - ev.clientX) / rect.width) * 100;
      setBoardPct(pct < 8 ? 0 : pct > 88 ? 100 : pct);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const theme = TIMER_THEMES[settings.theme] || TIMER_THEMES.vintage;
  const level = meter.active ? noiseLevel(meter.value) : null;
  const bg = level === null ? theme.bg : NOISE_COLORS[level];
  const fg = level === null ? theme.fg : level >= 3 ? "#ffffff" : "#1f2937";
  const editable = !running;

  const iconBtn = "flex h-[clamp(28px,3.6cqw,40px)] w-[clamp(28px,3.6cqw,40px)] items-center justify-center rounded-full transition hover:bg-black/10";
  // 오른쪽 위 도구 아이콘은 1.5배
  const topBtn = "flex h-[clamp(42px,5.4cqw,60px)] w-[clamp(42px,5.4cqw,60px)] items-center justify-center rounded-full transition hover:bg-black/10";

  return (
    <div
      ref={wrapRef}
      className={`flex select-none overflow-hidden ${cursor.className}`}
      {...cursor.handlers}
      // 화면 높이 그대로 → 아래로 스크롤하면 헤더가 올라가 타이머만 화면을 채운다
      style={{ height: isFull ? "100vh" : "max(100dvh, 420px)" }}
    >
      {/* 판서판만 보일 때는 시계를 숨긴다 (시간은 계속 흐르고 알림도 그대로) */}
      <section
        className={`relative min-w-0 flex-1 flex-col items-center justify-center gap-[4cqh] [container-type:size] ${boardPct === 100 ? "hidden" : "flex"}`}
        style={{ background: bg, color: fg, transition: "background-color 0.4s" }}
      >
        {/* 왼쪽 위: 소음 */}
        {meter.active && (
          <div className="absolute left-4 top-3 flex items-center gap-3">
            <span className="rounded-full bg-black/10 px-3 py-1 text-sm font-semibold tabular-nums">소음 {meter.value}</span>
            {!settings.hideCount && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="클릭 +1 · Ctrl+클릭 −1"
                  onClick={(e) => setCount((c) => (e.ctrlKey || e.metaKey ? Math.max(0, c - 1) : c + 1))}
                  className="min-w-12 rounded-xl bg-black/10 px-3 py-1 text-2xl font-bold tabular-nums"
                >
                  {count}
                </button>
                <button type="button" title="횟수 초기화" onClick={() => setCount(0)} className={iconBtn}>
                  <ArrowPathIcon className="h-[55%] w-[55%]" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 오른쪽 위: 도구 */}
        <div className="absolute right-3 top-2 flex items-center gap-1">
          <button type="button" title={meter.active ? "소음 측정 끄기" : "소음 측정"} onClick={toggleMeter} className={`${topBtn} ${meter.active ? "bg-black/15" : ""}`}>
            <MicrophoneIcon className="h-[60%] w-[60%]" />
          </button>
          <button type="button" title="설정" onClick={() => setModalId("TIMER_SETTINGS")} className={topBtn}>
            <Cog6ToothIcon className="h-[60%] w-[60%]" />
          </button>
          <button type="button" title={isFull ? "전체 화면 끝내기" : "전체 화면"} onClick={toggleFull} className={topBtn}>
            {isFull ? <ArrowsPointingInIcon className="h-[60%] w-[60%]" /> : <ArrowsPointingOutIcon className="h-[60%] w-[60%]" />}
          </button>
          <button
            type="button"
            title="판서판"
            onClick={() => setBoardPct((p) => (p > 0 ? 0 : BOARD_OPEN_PCT))}
            className={`${topBtn} ${boardPct > 0 ? "bg-black/15" : ""}`}
          >
            <PencilSquareIcon className="h-[60%] w-[60%]" />
          </button>
        </div>

        {/* 다른 화면에 있는 동안 끝났으면 (소리는 내지 않음) — 자리를 차지하지 않게 겹쳐서 */}
        {timer.finishedAway && (
          <div className="absolute left-1/2 top-[13%] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/10 px-[1em] py-[0.35em] text-[min(2.4cqw,4.5cqh)] font-semibold">
            다른 화면에 있는 동안 끝났어요
          </div>
        )}

        {settings.circle ? (
          <CircleTimer totalMs={timer.setMs} remainingMs={timer.remainingMs} running={running} runId={timer.runId}>
            <TimeDisplay ms={timer.remainingMs} editable={editable} onChange={timer.setTime} hideZeroHours />
          </CircleTimer>
        ) : (
          <TimeDisplay
            ms={timer.remainingMs}
            editable={editable}
            onChange={timer.setTime}
            className={`text-[min(19cqw,40cqh)] ${timer.status === "done" ? "animate-pulse" : ""}`}
          />
        )}

        <div className="flex flex-nowrap items-center justify-center gap-[0.4em] whitespace-nowrap text-[min(2.2cqw,4.5cqh)]">
          {PRESETS.map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => timer.addTime(min * 60_000)}
              className="rounded-full border-2 border-current px-[1em] py-[0.3em] font-semibold opacity-80 transition hover:opacity-100"
            >
              +{min}분
            </button>
          ))}
          <span className="mx-1" />
          <button
            type="button"
            onClick={toggleRun}
            className="flex w-[6.4em] items-center justify-center gap-1 rounded-full bg-black/80 py-[0.35em] font-bold text-white transition hover:bg-black"
          >
            {running ? <PauseIcon className="h-[1.1em] w-[1.1em]" /> : <PlayIcon className="h-[1.1em] w-[1.1em]" />}
            {running ? "일시정지" : timer.status === "paused" ? "계속" : "시작"}
          </button>
          <button
            type="button"
            onClick={timer.reset}
            className="rounded-full px-[0.8em] py-[0.35em] font-semibold opacity-70 transition hover:bg-black/10 hover:opacity-100"
          >
            초기화
          </button>
        </div>
      </section>

      {/* 판서판 경계: 끌어서 열기·크기 조절, 두 번 누르면 열기/닫기 (24px, 손가락으로도 잡기 쉽게) */}
      <div
        onPointerDown={onDividerDown}
        // 판서판만 보일 때 두 번 누르면 반반으로, 아니면 열기/닫기
        onDoubleClick={() => setBoardPct((p) => (p === 100 ? BOARD_OPEN_PCT : p > 0 ? 0 : BOARD_OPEN_PCT))}
        title="끌어서 판서판 크기 조절 (왼쪽 끝까지 밀면 판서판만) · 두 번 누르면 열기/닫기"
        className={`resize-cursor flex w-6 shrink-0 touch-none cursor-col-resize items-center justify-center gap-[3px] transition-colors ${
          dragging ? "bg-orange-300" : "bg-gray-200 hover:bg-orange-200"
        }`}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-14 w-[3px] rounded-full ${dragging ? "bg-orange-600" : "bg-gray-400"}`} />
        ))}
      </div>
      {boardPct > 0 && (
        <div className={boardPct === 100 ? "min-w-0 flex-1" : "shrink-0"} style={boardPct === 100 ? undefined : { width: `${boardPct}%` }}>
          <Board storageKey={`kkyul:timer-board:${id}`} />
        </div>
      )}

      <style>{BIG_CURSOR_CSS}</style>
      {cursor.dot}
      <SettingsModal modalId={modalId} setModalId={setModalId} settings={settings} update={update} />
    </div>
  );
}
