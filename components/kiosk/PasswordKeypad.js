"use client";

// 키오스크 비밀번호 키패드
// - 숫자는 화면에 보이지 않고 점(●)으로만 표시
// - "⌨ 문자 입력"을 누르면 일반 입력칸으로 바뀐다 (문자가 들어간 비밀번호를 쓰는 학생용)
// - PC 키보드의 숫자/백스페이스/엔터도 동작 (부모가 isActive일 때만)
import { useEffect, useRef } from "react";

const ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];
const MAX_LENGTH = 30;
const MIN_DOTS = 4;

function Key({ children, onPress, disabled, variant = "number", label }) {
  const base =
    "flex h-[64px] items-center justify-center rounded-2xl text-[1.6rem] font-bold select-none transition active:scale-95 shadow-[3px_3px_0px_1px_#808080a6] disabled:opacity-40 disabled:active:scale-100";
  const color =
    variant === "number" ? "bg-orange-200 active:bg-orange-300" : "bg-gray-200 text-[1.1rem] active:bg-gray-300";
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      // 터치에서 빠르게 연속으로 눌러도 바로 반응하도록 pointerdown 사용
      onPointerDown={(e) => {
        e.preventDefault();
        if (!disabled) onPress();
      }}
      className={`${base} ${color}`}
    >
      {children}
    </button>
  );
}

export default function PasswordKeypad({ value, onChange, onSubmit, disabled, isActive, textMode, onToggleTextMode }) {
  const inputRef = useRef(null);

  const append = (d) => value.length < MAX_LENGTH && onChange(value + d);
  const backspace = () => onChange(value.slice(0, -1));
  const clear = () => onChange("");

  // PC 키보드 지원 (키패드 모드에서만. 문자 입력 모드는 입력칸이 직접 처리)
  useEffect(() => {
    if (textMode) return;
    const onKey = (e) => {
      if (!isActive?.() || disabled) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        append(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (textMode) inputRef.current?.focus();
  }, [textMode]);

  const dotCount = Math.max(MIN_DOTS, value.length);

  return (
    <div className="flex flex-col items-center">
      {textMode ? (
        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onSubmit())}
          disabled={disabled}
          autoComplete="off"
          placeholder="비밀번호를 입력해주세요"
          className="input input-bordered input-warning my-[12px] w-full max-w-[320px] text-[1.4rem]"
        />
      ) : (
        <>
          <div className="my-[16px] flex h-[28px] flex-wrap items-center justify-center gap-[10px]" aria-label={`${value.length}자리 입력됨`}>
            {Array.from({ length: dotCount }, (_, i) => (
              <span
                key={i}
                className={`h-[18px] w-[18px] rounded-full border-2 border-orange-500 ${i < value.length ? "bg-orange-500" : "bg-transparent"}`}
              />
            ))}
          </div>

          <div className="grid w-full max-w-[320px] grid-cols-3 gap-[12px]">
            {ROWS.flat().map((d) => (
              <Key key={d} onPress={() => append(d)} disabled={disabled}>
                {d}
              </Key>
            ))}
            <Key variant="fn" onPress={clear} disabled={disabled || !value} label="전체 지우기">
              전체지움
            </Key>
            <Key onPress={() => append("0")} disabled={disabled}>
              0
            </Key>
            <Key variant="fn" onPress={backspace} disabled={disabled || !value} label="한 글자 지우기">
              ←
            </Key>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value}
        className="btn mt-[16px] w-full max-w-[320px] border-0 bg-orange-500 text-[1.3rem] text-white disabled:bg-orange-300 disabled:text-white"
      >
        {disabled ? "확인 중..." : "확인"}
      </button>

      <button
        type="button"
        onClick={() => {
          onChange("");
          onToggleTextMode();
        }}
        className="mt-[12px] text-sm text-gray-500 underline underline-offset-4"
      >
        {textMode ? "🔢 숫자 키패드로" : "⌨ 문자 입력"}
      </button>
    </div>
  );
}
