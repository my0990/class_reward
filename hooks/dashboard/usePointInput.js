"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const BASE_FONT = 1.7;

export default function usePointInput({ onEnter } = {}) {
  const [value, setValue] = useState("");
  const [activeKey, setActiveKey] = useState(null);

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

  // const submit = () => {
  //   setActiveKey("Enter");
  //   onEnterRef.current?.(valueRef.current);
  // };
  const submit = () => {
    setActiveKey("Enter");
    return onEnterRef.current?.(valueRef.current);
  };

  const clear = () => {
    setValue("");
    setActiveKey(null);
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
        submit();
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
    },
    actions: {
      onNumber: appendNumber,   // 숫자 버튼 클릭
      onBackspace: removeLast,  // ⌫ 버튼 클릭
      onSubmit: submit,         // 입력 버튼 클릭
      clear,
    },
  };
}