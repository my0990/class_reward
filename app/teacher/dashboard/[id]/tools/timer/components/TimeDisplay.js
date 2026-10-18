"use client";
import { pad2, replaceUnit, splitTime } from "@/util/timer/timerMath";

/** 시:분:초. 멈춰 있을 때는 숫자를 눌러 바로 고칠 수 있다. */
export default function TimeDisplay({ ms, editable, onChange, hideZeroHours = false, className = "" }) {
  const { h, m, s } = splitTime(ms);
  const units = [
    ["h", h],
    ["m", m],
    ["s", s],
  ].filter(([u, v]) => !hideZeroHours || u !== "h" || v > 0); // 시작·정지와 상관없이 같은 자리 유지

  return (
    <div className={`flex items-center justify-center font-bold tabular-nums leading-none ${className}`}>
      {units.map(([unit, v], i) => (
        <span key={unit} className="flex items-center">
          {i > 0 && <span className="-mx-[0.15em] pb-[0.08em]">:</span>}
          {/* 멈춤·진행 모두 같은 input을 써서 높이·너비가 똑같다 (span↔input으로 바꾸면 줄 높이가 달라져 아래 버튼이 움직였음) */}
          <input
            aria-label={{ h: "시", m: "분", s: "초" }[unit]}
            inputMode="numeric"
            value={pad2(v)}
            readOnly={!editable}
            tabIndex={editable ? 0 : -1}
            onFocus={(e) => editable && e.target.select()}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(-2);
              const next = unit === "h" ? digits : String(Math.min(59, Number(digits || 0)));
              onChange(replaceUnit(ms, unit, next));
            }}
            className={`w-[calc(2ch+0.3em)] rounded-lg bg-transparent p-0 text-center leading-none outline-none transition ${
              editable ? "hover:bg-black/5 focus:bg-black/10" : "pointer-events-none"
            }`}
          />
        </span>
      ))}
    </div>
  );
}
