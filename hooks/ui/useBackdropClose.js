"use client";
import { useRef } from "react";

/**
 * 창 바깥(배경)을 눌러 닫기 — 누를 때(pointerdown)와 뗄 때(click) 모두 배경일 때만 닫는다.
 * 창 안에서 글자를 드래그하다가 바깥에서 손을 떼는 등, 실수로 닫히는 일을 막는다.
 *   const backdrop = useBackdropClose(close);
 *   <div {...backdrop}> <div>창 내용</div> </div>
 */
export default function useBackdropClose(onClose, { disabled = false } = {}) {
  const downOnBackdrop = useRef(false);
  return {
    onPointerDown: (e) => {
      downOnBackdrop.current = e.target === e.currentTarget;
    },
    onClick: (e) => {
      const ok = downOnBackdrop.current && e.target === e.currentTarget;
      downOnBackdrop.current = false;
      if (ok && !disabled) onClose?.();
    },
  };
}
