"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { playCountdown, playDone, playLoud, unlockSound } from "@/util/timer/sounds";
import TimeDisplay from "./components/TimeDisplay";
import CircleTimer from "./components/CircleTimer";
import SettingsModal from "./components/SettingsModal";

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
  const [height, setHeight] = useState(null);
  const wrapRef = useRef(null);

  const timer = useCountdown({
    onSecond: (sec) => sec <= 3 && playCountdown(),
    onDone: playDone,
  });

  const muteRef = useRef(settings.muteAlert);
  muteRef.current = settings.muteAlert;
  const meter = useNoiseMeter({
    sensitivity: settings.sensitivity,
    onLoud: () => {
      setCount((c) => c + 1);
      if (!muteRef.current) playLoud();
    },
  });

  // 헤더 아래 남은 화면을 꽉 채운다
  useLayoutEffect(() => {
    const fit = () => {
      const el = wrapRef.current;
      if (!el) return;
      setHeight(window.innerHeight - (el.getBoundingClientRect().top + window.scrollY));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

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

  // 가운데 막대를 끌어 판서판 너비 조절 (끝까지 밀면 닫힘)
  const onDividerDown = (e) => {
    e.preventDefault();
    const rect = wrapRef.current.getBoundingClientRect();
    const move = (ev) => {
      const pct = ((rect.right - ev.clientX) / rect.width) * 100;
      setBoardPct(pct < 8 ? 0 : Math.min(75, pct));
    };
    const up = () => {
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

  const iconBtn = "flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/10";

  return (
    <div
      ref={wrapRef}
      className="flex select-none overflow-hidden"
      style={{ height: isFull ? "100vh" : height ? Math.max(height, 420) : "calc(100dvh - 64px)" }}
    >
      <section
        className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-[4cqh] [container-type:size]"
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
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 오른쪽 위: 도구 */}
        <div className="absolute right-3 top-2 flex items-center gap-1">
          <button type="button" title={meter.active ? "소음 측정 끄기" : "소음 측정"} onClick={toggleMeter} className={`${iconBtn} ${meter.active ? "bg-black/15" : ""}`}>
            <MicrophoneIcon className="h-6 w-6" />
          </button>
          <button type="button" title="설정" onClick={() => setModalId("TIMER_SETTINGS")} className={iconBtn}>
            <Cog6ToothIcon className="h-6 w-6" />
          </button>
          <button type="button" title={isFull ? "전체 화면 끝내기" : "전체 화면"} onClick={toggleFull} className={iconBtn}>
            {isFull ? <ArrowsPointingInIcon className="h-6 w-6" /> : <ArrowsPointingOutIcon className="h-6 w-6" />}
          </button>
          <button
            type="button"
            title="판서판"
            onClick={() => setBoardPct((p) => (p > 0 ? 0 : BOARD_OPEN_PCT))}
            className={`${iconBtn} ${boardPct > 0 ? "bg-black/15" : ""}`}
          >
            <PencilSquareIcon className="h-6 w-6" />
          </button>
        </div>

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

        <div className="flex flex-wrap items-center justify-center gap-2 text-[clamp(14px,2.4cqw,22px)]">
          {PRESETS.map((min) => (
            <button
              key={min}
              type="button"
              disabled={running}
              onClick={() => timer.setTime(min * 60_000)}
              className="rounded-full border-2 border-current px-[1em] py-[0.3em] font-semibold opacity-80 transition hover:opacity-100 disabled:opacity-30"
            >
              {min}분
            </button>
          ))}
          <span className="mx-1" />
          <button
            type="button"
            onClick={toggleRun}
            className="flex items-center gap-1 rounded-full bg-black/80 px-[1.2em] py-[0.35em] font-bold text-white transition hover:bg-black"
          >
            {running ? <PauseIcon className="h-[1.1em] w-[1.1em]" /> : <PlayIcon className="h-[1.1em] w-[1.1em]" />}
            {running ? "일시정지" : timer.status === "paused" ? "계속" : "시작"}
          </button>
          <button
            type="button"
            onClick={timer.reset}
            className="rounded-full px-[0.8em] py-[0.35em] font-semibold opacity-70 transition hover:bg-black/10 hover:opacity-100"
          >
            처음으로
          </button>
        </div>
      </section>

      {/* 판서판 경계 (끌어서 열기·크기 조절) */}
      <div
        onPointerDown={onDividerDown}
        title="끌어서 판서판 열기"
        className="flex w-3 shrink-0 cursor-col-resize items-center justify-center bg-gray-200 hover:bg-gray-300"
      >
        <span className="h-10 w-1 rounded-full bg-gray-400" />
      </div>
      {boardPct > 0 && (
        <div className="shrink-0" style={{ width: `${boardPct}%` }}>
          <Board storageKey={`kkyul:timer-board:${id}`} />
        </div>
      )}

      <SettingsModal modalId={modalId} setModalId={setModalId} settings={settings} update={update} />
    </div>
  );
}
