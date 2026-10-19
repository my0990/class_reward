"use client";
// 교실 화면(칠판·TV)에서 마우스가 잘 보이게
// 1) 기본 화살표를 크게(48px, 운영체제 기본처럼 흰 화살표 + 검은 테두리),
//    누를 수 있는 곳(버튼·시간 입력칸·설정 칸)은 큰 손가락. 소음 배경색이 바뀌어도 잘 보임.
//    판서판 글 쓰는 곳(글자 커서)·경계 막대(좌우 화살표)는 원래 커서. 판서판 입력 막대는 노란색
// 2) 2.5초 동안 움직이지 않으면 커서를 숨긴다 (숫자를 가리지 않게)
// 3) (설정에서 켜면) 커서를 따라다니는 노란 원 — 위치는 ref로 직접 옮겨서 화면을 다시 그리지 않는다
import { useCallback, useEffect, useRef, useState } from "react";

const svg = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
// 기본 화살표: 끝점 = (8, 4)
const ARROW = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'><path d='M4 2L4 19L8.5 14.8L11.5 21.5L14.3 20.3L11.4 13.8L17.5 13.8Z' fill='white' stroke='black' stroke-width='1.3' stroke-linejoin='round'/></svg>`,
);
// 손가락(포인터) 모양: 흰 손 + 검은 테두리, 끝점(손가락 끝) = (21, 2)
const HAND = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'><path d='M9 2.6a1.5 1.5 0 0 1 3 0V10.2a1.4 1.4 0 0 1 2.7.4a1.4 1.4 0 0 1 2.7.5a1.4 1.4 0 0 1 2.7.6V16.2c0 3.3-2.3 5.8-5.6 5.8h-1.6c-1.8 0-3.2-.8-4.3-2.2L4.9 15.2a1.5 1.5 0 0 1 2.3-1.9L9 15.1V2.6zM12 10.2v4.3M14.7 10.6v3.9M17.4 11.1v3.4' fill='white' stroke='black' stroke-width='1.3' stroke-linejoin='round' stroke-linecap='round'/></svg>`,
);

// .timer-cursor 안에만 적용 (아래 규칙일수록 더 구체적이라 우선)
export const BIG_CURSOR_CSS = `
.timer-cursor, .timer-cursor * { cursor: ${ARROW} 8 4, default !important; }
.timer-cursor .board-cursor, .timer-cursor .board-cursor * { cursor: text !important; }
.timer-cursor .resize-cursor { cursor: col-resize !important; }
.timer-cursor button, .timer-cursor button *, .timer-cursor input, .timer-cursor select, .timer-cursor label:has(input) {
  cursor: ${HAND} 21 2, pointer !important;
}
.timer-cursor .board-cursor { caret-color: #ffe066; }
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
