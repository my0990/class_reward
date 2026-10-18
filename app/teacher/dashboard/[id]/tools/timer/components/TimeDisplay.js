"use client";
import { pad2, replaceUnit, splitTime } from "@/util/timer/timerMath";

/** 시:분:초. 멈춰 있을 때는 숫자를 눌러 바로 고칠 수 있다. */
export default function TimeDisplay({ ms, editable, onChange, hideZeroHours = false, className = "" }) {
  const { h, m, s } = splitTime(ms);
  const units = [
    ["h", h],
    ["m", m],
    ["s", s],
  ].filter(([u, v]) => u !== "h" || v > 0 || (editable && !hideZeroHours)); // 0시간은 고칠 때만 보임

  return (
    <div className={`flex items-center justify-center font-bold tabular-nums leading-none ${className}`}>
      {units.map(([unit, v], i) => (
        <span key={unit} className="flex items-center">
          {i > 0 && <span className="px-[0.05em] pb-[0.08em]">:</span>}
          {editable ? (
            <input
              aria-label={{ h: "시", m: "분", s: "초" }[unit]}
              inputMode="numeric"
              value={pad2(v)}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(-2);
                const next = unit === "h" ? digits : String(Math.min(59, Number(digits || 0)));
                onChange(replaceUnit(ms, unit, next));
              }}
              className="w-[1.25em] rounded-lg bg-transparent text-center outline-none transition hover:bg-black/5 focus:bg-black/10"
            />
          ) : (
            <span className="w-[1.25em] text-center">{pad2(v)}</span>
          )}
        </span>
      ))}
    </div>
  );
}
