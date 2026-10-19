"use client";
// 교실 화면(칠판·TV)에서 마우스가 잘 보이게
// 1) 큰 커서: 흰 테두리 검은 화살표(48px) — 소음 배경색(초록~빨강)이 바뀌어도 잘 보임
//    판서판 글 쓰는 곳은 큰 노란 I자 커서 + 노란 입력 막대(caret)
// 2) 2.5초 동안 움직이지 않으면 커서를 숨긴다 (숫자를 가리지 않게)
// 3) (설정에서 켜면) 커서를 따라다니는 노란 원 — 위치는 ref로 직접 옮겨서 화면을 다시 그리지 않는다
import { useCallback, useEffect, useRef, useState } from "react";

const svg = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const ARROW = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'><path d='M4 2L4 19L8.5 14.8L11.5 21.5L14.3 20.3L11.4 13.8L17.5 13.8Z' fill='black' stroke='white' stroke-width='1.6' stroke-linejoin='round'/></svg>`,
);
const IBEAM = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 16 24'><g fill='none' stroke-linecap='round'><path d='M5 2h6M8 2v20M5 22h6' stroke='black' stroke-width='4'/><path d='M5 2h6M8 2v20M5 22h6' stroke='#ffe066' stroke-width='2'/></g></svg>`,
);

// .timer-cursor 안에서만 적용 (버튼 위에서도 손가락 대신 큰 화살표)
export const BIG_CURSOR_CSS = `
.timer-cursor, .timer-cursor * { cursor: ${ARROW} 8 4, auto !important; }
.timer-cursor .board-cursor, .timer-cursor .board-cursor * { cursor: ${IBEAM} 16 24, text !important; caret-color: #ffe066; }
.timer-cursor .resize-cursor { cursor: col-resize !important; }
.timer-cursor.cursor-idle, .timer-cursor.cursor-idle * { cursor: none !important; }
`;

const IDLE_MS = 2500;

export function useBigCursor({ highlight = false } = {}) {
  const [idle, setIdle] = useState(false);
  const idleRef = useRef(false);
  const timer = useRef(null);
  const dotRef = useRef(null);

  const wake = useCallback(() => {
    if (idleRef.current) {
      idleRef.current = false;
      setIdle(false);
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      idleRef.current = true;
      setIdle(true);
    }, IDLE_MS);
  }, []);

  const onPointerMove = useCallback(
    (e) => {
      if (e.pointerType !== "mouse") return; // 터치(전자칠판 손가락)는 커서가 없다
      wake();
      const dot = dotRef.current;
      if (dot) {
        dot.style.opacity = "1";
        dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    },
    [wake],
  );
  const onPointerDown = useCallback(
    (e) => {
      onPointerMove(e);
      const dot = dotRef.current;
      if (!dot || e.pointerType !== "mouse") return;
      dot.firstChild?.animate([{ transform: "scale(1)" }, { transform: "scale(1.6)" }, { transform: "scale(1)" }], { duration: 300 });
    },
    [onPointerMove],
  );
  const onPointerLeave = useCallback(() => {
    if (dotRef.current) dotRef.current.style.opacity = "0";
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const showDot = highlight && !idle;
  const dot = (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-40 transition-opacity duration-200"
      style={{ opacity: 0, visibility: showDot ? "visible" : "hidden" }}
    >
      <div className="-ml-7 -mt-7 h-14 w-14 rounded-full border-4 border-yellow-300/90 bg-yellow-300/30" />
    </div>
  );

  return {
    className: `timer-cursor ${idle ? "cursor-idle" : ""}`,
    handlers: { onPointerMove, onPointerDown, onPointerLeave },
    dot,
  };
}
