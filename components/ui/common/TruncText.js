"use client";
// 한 줄로 자르고(...) 넘친 글자는 클릭하면 말풍선으로 전체를 보여준다
// - 실제로 잘렸을 때만 말풍선을 띄우고 카드 선택 클릭은 막음 / 안 잘렸으면 원래 클릭(선택) 그대로
// - 다시 누르거나 다른 곳을 누르면 닫힘, 4초 뒤 자동으로 닫힘
import { useEffect, useRef, useState } from "react";

export default function TruncText({ as: Tag = "div", className = "", children }) {
  const ref = useRef(null);
  const textRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [canExpand, setCanExpand] = useState(false); // 마우스를 올렸을 때 실제로 잘려 있으면 글자 쪽 스타일 표시

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const t = setTimeout(() => setOpen(false), 4000);
    document.addEventListener("pointerdown", close);
    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", close);
    };
  }, [open]);

  const onClick = (e) => {
    if (open) {
      e.stopPropagation();
      setOpen(false);
      return;
    }
    const el = textRef.current;
    if (el && el.scrollWidth > el.clientWidth + 1) {
      e.stopPropagation();
      setOpen(true);
    }
  };

  const onMouseEnter = () => {
    const el = textRef.current;
    setCanExpand(!!el && el.scrollWidth > el.clientWidth + 1);
  };

  return (
    <Tag
      ref={ref}
      className={`relative ${className} ${
        canExpand ? "cursor-help rounded-md hover:ring-2 hover:ring-orange-700/60 hover:underline hover:decoration-dotted hover:underline-offset-[3px]" : ""
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <span ref={textRef} className="block truncate">
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-[4px] w-max max-w-[220px] -translate-x-1/2 whitespace-normal break-all rounded-md bg-gray-800 px-[8px] py-[4px] text-center text-[0.875rem] font-medium leading-snug text-white shadow-lg"
        >
          {children}
        </span>
      )}
    </Tag>
  );
}
