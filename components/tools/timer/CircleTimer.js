"use client";
import { circleColor } from "@/util/timer/timerMath";

const R = 45;
const C = 2 * Math.PI * R;

/**
 * 원형 타이머. 줄어드는 원은 CSS 애니메이션이 그린다 (자바스크립트는 초마다 숫자·색만 바꿈).
 * runId가 바뀌면 처음부터 다시 그림, 일시정지는 animation-play-state로.
 */
export default function CircleTimer({ totalMs, remainingMs, running, runId, children }) {
  const total = Math.max(totalMs, 1);
  const elapsed = Math.max(0, total - remainingMs);
  const color = circleColor(Math.ceil(remainingMs / 1000));

  return (
    <div className="relative aspect-square h-[min(72cqh,62cqw)]">
      <style>{`@keyframes kkyul-drain { from { stroke-dashoffset: 0 } to { stroke-dashoffset: ${C} } }`}</style>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="6" />
        <circle
          key={runId}
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          style={{
            animation: `kkyul-drain ${total}ms linear forwards`,
            animationDelay: `-${elapsed}ms`,
            animationPlayState: running ? "running" : "paused",
            transition: "stroke 0.4s",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[min(16cqh,13cqw)]">{children}</div>
    </div>
  );
}
