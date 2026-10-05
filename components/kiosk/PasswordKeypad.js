"use client";

// 키오스크 비밀번호 키패드
// - 숫자는 화면에 보이지 않고 점으로만 표시 (채워질 때 톡 튀어나오는 애니메이션)
// - 틀리면 점이 좌우로 흔들림 (shakeKey가 바뀔 때)
// - "문자 입력"을 누르면 일반 입력칸으로 바뀐다 (문자가 들어간 비밀번호를 쓰는 학생용)
// - PC 키보드의 숫자/백스페이스/엔터도 동작 (부모가 isActive일 때만)
import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const MAX_LENGTH = 30;
const MIN_DOTS = 4;

// 눌렀을 때 살짝 내려가는 말랑한 3D 버튼
function Key({ children, onPress, disabled, variant = "number", label }) {
  const look =
    variant === "number"
      ? "bg-white text-orange-500 text-[1.9rem] shadow-[0_5px_0_#fdba74] active:shadow-[0_1px_0_#fdba74]"
      : "bg-orange-50 text-orange-400 text-[1rem] shadow-[0_5px_0_#fed7aa] active:shadow-[0_1px_0_#fed7aa]";
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
      className={`
        ${look}
        flex aspect-[5/4] w-full select-none items-center justify-center
        rounded-[26px] font-extrabold
        ring-1 ring-orange-100
        transition-[transform,box-shadow] duration-75
        active:translate-y-[4px]
        disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0
      `}
    >
      {children}
    </button>
  );
}

function BackspaceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-7 w-7" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7 6-7Z" />
      <path strokeLinecap="round" d="m12 10 4 4m0-4-4 4" />
    </svg>
  );
}

export default function PasswordKeypad({
  value,
  onChange,
  onSubmit,
  disabled,
  isActive,
  textMode,
  onToggleTextMode,
  shakeKey = 0,
}) {
  const inputRef = useRef(null);
  const dots = useAnimationControls();

  const append = (d) => value.length < MAX_LENGTH && onChange(value + d);
  const backspace = () => onChange(value.slice(0, -1));
  const clear = () => onChange("");

  // 틀렸을 때 흔들기
  useEffect(() => {
    if (!shakeKey) return;
    dots.start({ x: [0, -12, 12, -8, 8, -4, 0], transition: { duration: 0.45 } });
  }, [shakeKey, dots]);

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
    <div className="flex w-full flex-col items-center">
      {textMode ? (
        <motion.input
          animate={dots}
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          disabled={disabled}
          autoComplete="off"
          placeholder="비밀번호를 입력해요"
          className="
            mb-[8px] mt-[20px] h-[56px] w-full max-w-[300px] rounded-full border-2 border-orange-200
            bg-white px-[20px] text-center text-[1.4rem] tracking-[0.3em] text-orange-500
            outline-none placeholder:tracking-normal placeholder:text-orange-200 focus:border-orange-400
          "
        />
      ) : (
        <motion.div
          animate={dots}
          className="my-[22px] flex min-h-[22px] flex-wrap items-center justify-center gap-[12px]"
          aria-label={`${value.length}자리 입력됨`}
        >
          {Array.from({ length: dotCount }, (_, i) => {
            const filled = i < value.length;
            return (
              <span key={i} className="relative flex h-[20px] w-[20px] items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-orange-100" />
                <AnimatePresence>
                  {filled && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.35, 1] }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.22 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 shadow-[0_2px_6px_rgba(251,146,60,0.5)]"
                    />
                  )}
                </AnimatePresence>
              </span>
            );
          })}
        </motion.div>
      )}

      {!textMode && (
        <div className="grid w-full max-w-[300px] grid-cols-3 gap-[14px]">
          {DIGITS.map((d) => (
            <Key key={d} onPress={() => append(d)} disabled={disabled}>
              {d}
            </Key>
          ))}
          <Key variant="fn" onPress={clear} disabled={disabled || !value} label="전체 지우기">
            모두
            <br />
            지우기
          </Key>
          <Key onPress={() => append("0")} disabled={disabled}>
            0
          </Key>
          <Key variant="fn" onPress={backspace} disabled={disabled || !value} label="한 글자 지우기">
            <BackspaceIcon />
          </Key>
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value}
        className="
          mt-[22px] h-[58px] w-full max-w-[300px] rounded-full
          bg-gradient-to-r from-orange-400 to-amber-400 text-[1.3rem] font-extrabold text-white
          shadow-[0_5px_0_#ea580c] transition-[transform,box-shadow] duration-75
          active:translate-y-[4px] active:shadow-[0_1px_0_#ea580c]
          disabled:from-orange-200 disabled:to-amber-200 disabled:shadow-[0_5px_0_#fdba74] disabled:active:translate-y-0
        "
      >
        {disabled ? "확인하는 중..." : "확인"}
      </button>

      <button
        type="button"
        onClick={() => {
          onChange("");
          onToggleTextMode();
        }}
        className="
          mt-[14px] rounded-full bg-white/70 px-[14px] py-[6px] text-[0.9rem] text-orange-400
          ring-1 ring-orange-200 hover:bg-white
        "
      >
        {textMode ? "🔢 숫자 키패드로" : "🔤 문자 비밀번호예요"}
      </button>
    </div>
  );
}
