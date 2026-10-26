"use client";
// 여러 줄 글을 정해진 줄 수만 보여주고(...) 잘렸으면 클릭해서 전체 보기
// - 펼친 글은 같은 자리 위에 덮어서 보여줘 카드 높이가 바뀌지 않음 (아래쪽 기준으로 위로 늘어남)
// - 다시 누르거나 다른 곳을 누르면 접힘
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function ClampText({ children, lines = 4, className = "" }) {
  const ref = useRef(null);
  const textRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);

  // 글이나 너비가 바뀌면 잘렸는지 다시 확인
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, lines]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const toggle = () => clamped && setOpen((v) => !v);
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div ref={ref} className="relative">
      <div
        className={`${className} ${clamped ? "cursor-pointer hover:ring-2 hover:ring-orange-400" : ""}`}
        onClick={toggle}
        {...(clamped ? { role: "button", tabIndex: 0, onKeyDown, "aria-expanded": open, title: "눌러서 전체 보기" } : {})}
      >
        <div
          ref={textRef}
          className="overflow-hidden whitespace-pre-wrap break-words"
          style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines }}
        >
          {children}
        </div>
      </div>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className={`${className} absolute inset-x-0 bottom-0 z-20 !h-auto max-h-[320px] cursor-pointer overflow-y-auto whitespace-pre-wrap break-words shadow-lg ring-2 ring-orange-400`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
