"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const BASE_FONT = 1.7;

export default function usePointInput({ onEnter } = {}) {
  const [value, setValue] = useState("");
  const [activeKey, setActiveKey] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ 중복 제출 방지: 버튼 클릭과 키보드 Enter가 둘 다 결국 이 submit()을 호출하므로,
  // 잠금은 반드시 여기(공통 진입점)에 있어야 한다. DialPad 쪽에서만 막으면
  // 키보드 Enter 연타는 그대로 뚫린다.
  const isSubmittingRef = useRef(false);

  /* -------------------------------
     최신 value / onEnter 보존
  -------------------------------- */
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const onEnterRef = useRef(onEnter);
  useEffect(() => {
    onEnterRef.current = onEnter;
  }, [onEnter]);

  /* -------------------------------
     표시용 fontSize
  -------------------------------- */
  const fontSize = useMemo(() => {
    if (!value) return BASE_FONT;
    return Math.min(BASE_FONT, 12 / value.length);
  }, [value]);

  /* -------------------------------
     🔑 핵심 액션들
     (키보드/마우스 공통)
  -------------------------------- */
  const appendNumber = (num) => {
    setValue((prev) => prev + num);
    setActiveKey(num);
  };

  const removeLast = () => {
    setValue((prev) => prev.slice(0, -1));
    setActiveKey("Backspace");
  };

  const clear = () => {
    setValue("");
    setActiveKey(null);
  };

  // ✅ 성공 시에만 입력값을 자동으로 비움 (onEnter가 reject하면 clear() 호출 안 됨 -> 값 보존)
  // ✅ 이미 처리 중이면 두 번째 호출은 조용히 무시 (버튼 연타 + 키보드 Enter 연타 모두 방어)
  const submit = async () => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setActiveKey("Enter");

    try {
      const result = await onEnterRef.current?.(valueRef.current);
      clear();
      return result;
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  /* -------------------------------
     키보드 입력
  -------------------------------- */
  useEffect(() => {
    const allowed = new Set([
      "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
      "Enter", "Backspace"
    ]);

    const handleKeyDown = (e) => {
      if (!allowed.has(e.key)) return;

      if (e.key >= "0" && e.key <= "9") {
        appendNumber(e.key);
        return;
      }

      if (e.key === "Backspace") {
        removeLast();
        return;
      }

      if (e.key === "Enter") {
        // 키보드 Enter는 DialPad의 try/catch를 거치지 않으므로,
        // 실패 시 unhandled rejection만 막아준다 (에러 토스트는 버튼 클릭 경로에서만 표시됨).
        submit().catch(() => {});
        return;
      }
    };

    const handleKeyUp = () => setActiveKey(null);
    // ✅ 마우스 버튼 놓으면 activeKey 해제
    const handleMouseUp = () => setActiveKey(null);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  /* -------------------------------
     외부로 노출
  -------------------------------- */
  return {
    display: {
      value,
      fontSize,
      activeKey,
      isSubmitting,   // ✅ 버튼/키보드 어느 경로로 제출했든 동일하게 반영됨
    },
    actions: {
      onNumber: appendNumber,   // 숫자 버튼 클릭
      onBackspace: removeLast,  // ⌫ 버튼 클릭
      onSubmit: submit,         // 입력 버튼 클릭
      clear,
    },
  };
}