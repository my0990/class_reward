"use client";
// 교실 화면(칠판·TV)에서 마우스가 잘 보이게
// 1) 큰 커서(48px, 흰 바탕 + 검은 테두리): 기본 화살표 / 누를 수 있는 곳(버튼·입력칸)은 손가락 /
//    판서판 글 쓰는 곳은 I자 / 판서판 경계 막대는 좌우 화살표. 판서판 입력 막대는 노란색.
//    진짜 커서는 숨기고 커서 그림을 화면에 직접 그린다.
//    (크롬은 32px보다 큰 CSS 커서가 화면 가장자리에 걸치면 작은 기본 커서로 바꿔 버려서, 위쪽 아이콘 근처에서 작아졌음)
//    위치·모양은 ref로 직접 바꿔서 마우스를 움직여도 화면을 다시 그리지 않는다.
// 2) 2.5초 동안 움직이지 않으면 커서를 숨긴다 (숫자를 가리지 않게)
// 3) (설정에서 켜면) 커서를 따라다니는 노란 원
import { useCallback, useEffect, useRef } from "react";

const svg = (s) => `data:image/svg+xml,${encodeURIComponent(s)}`;
// 기본 화살표: 끝점 = (8, 4)
const ARROW = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'><path d='M4 2L4 19L8.5 14.8L11.5 21.5L14.3 20.3L11.4 13.8L17.5 13.8Z' fill='white' stroke='black' stroke-width='1.3' stroke-linejoin='round'/></svg>`,
);
// 글자 커서(I자): 끝점 = 가운데 (16, 24)
const IBEAM = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 16 24'><g fill='none' stroke-linecap='round'><path d='M5 2.5h6M8 2.5v19M5 21.5h6' stroke='white' stroke-width='4'/><path d='M5 2.5h6M8 2.5v19M5 21.5h6' stroke='black' stroke-width='1.8'/></g></svg>`,
);
// 좌우 크기 조절: 끝점 = 가운데 (24, 24)
const RESIZE = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'><path d='M11 3h2v7.5h4V7l5 5-5 5v-3.5h-4V21h-2v-7.5H7V17l-5-5 5-5v3.5h4Z' fill='white' stroke='black' stroke-width='1.2' stroke-linejoin='round'/></svg>`,
);
// 손가락(포인터) 모양: 흰 손 + 검은 테두리, 끝점(손가락 끝) = (21, 2)
const HAND = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'><path d='M9 2.6a1.5 1.5 0 0 1 3 0V10.2a1.4 1.4 0 0 1 2.7.4a1.4 1.4 0 0 1 2.7.5a1.4 1.4 0 0 1 2.7.6V16.2c0 3.3-2.3 5.8-5.6 5.8h-1.6c-1.8 0-3.2-.8-4.3-2.2L4.9 15.2a1.5 1.5 0 0 1 2.3-1.9L9 15.1V2.6zM12 10.2v4.3M14.7 10.6v3.9M17.4 11.1v3.4' fill='white' stroke='black' stroke-width='1.3' stroke-linejoin='round' stroke-linecap='round'/></svg>`,
);


// 모양별 그림과 끝점(누르는 위치, px)
const SHAPES = {
  arrow: { src: ARROW, w: 48, h: 48, x: 8, y: 4 },
  hand: { src: HAND, w: 48, h: 48, x: 21, y: 2 },
  text: { src: IBEAM, w: 32, h: 48, x: 16, y: 24 },
  resize: { src: RESIZE, w: 48, h: 48, x: 24, y: 24 },
};

/** 마우스 아래 요소로 커서 모양 고르기 */
function shapeFor(target) {
  const el = target instanceof Element ? target : null;
  if (!el) return "arrow";
  if (el.closest(".resize-cursor")) return "resize";
  if (el.closest(".board-cursor")) return "text";
  if (el.closest("button, input, select, label:has(input), a[href]")) return "hand";
  return "arrow";
}

// .timer-cursor 안에서는 진짜 커서를 숨긴다 (커서 그림이 대신 보임)
export const BIG_CURSOR_CSS = `
.timer-cursor, .timer-cursor * { cursor: none !important; }
.timer-cursor .board-cursor { caret-color: #ffe066; }
`;

const IDLE_MS = 2500;

export function useBigCursor({ highlight = false } = {}) {
  const cursorRef = useRef(null); // 커서 그림
  const dotRef = useRef(null); // 강조 원
  const shapeRef = useRef("arrow");
  const timer = useRef(null);
  const highlightRef = useRef(highlight);
  highlightRef.current = highlight;

  const show = useCallback((visible) => {
    if (cursorRef.current) cursorRef.current.style.opacity = visible ? "1" : "0";
    if (dotRef.current) dotRef.current.style.opacity = visible && highlightRef.current ? "1" : "0";
  }, []);

  const onPointerMove = useCallback(
    (e) => {
      if (e.pointerType !== "mouse") return show(false); // 터치(전자칠판 손가락)는 커서가 없다
      const { clientX: x, clientY: y } = e;

      const cur = cursorRef.current;
      if (cur) {
        const name = shapeFor(e.target);
        if (name !== shapeRef.current) {
          shapeRef.current = name;
          const sh = SHAPES[name];
          cur.src = sh.src;
          cur.width = sh.w;
          cur.height = sh.h;
        }
        const sh = SHAPES[shapeRef.current];
        cur.style.transform = `translate(${x - sh.x}px, ${y - sh.y}px)`;
      }
      if (dotRef.current) dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      show(true);

      // 가만히 있으면 숨기기
      clearTimeout(timer.current);
      timer.current = setTimeout(() => show(false), IDLE_MS);
    },
    [show],
  );
  const onPointerDown = useCallback(
    (e) => {
      onPointerMove(e);
      if (e.pointerType === "mouse" && highlightRef.current) {
        dotRef.current?.firstChild?.animate([{ transform: "scale(1)" }, { transform: "scale(1.6)" }, { transform: "scale(1)" }], { duration: 300 });
      }
    },
    [onPointerMove],
  );
  const onPointerLeave = useCallback(() => show(false), [show]);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!highlight && dotRef.current) dotRef.current.style.opacity = "0";
  }, [highlight]);

  const layer = (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[90] transition-opacity duration-200"
        style={{ opacity: 0 }}
      >
        <div className="-ml-7 -mt-7 h-14 w-14 rounded-full border-4 border-yellow-300/90 bg-yellow-300/30" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={cursorRef}
        src={SHAPES.arrow.src}
        width={SHAPES.arrow.w}
        height={SHAPES.arrow.h}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none fixed left-0 top-0 z-[100] select-none drop-shadow"
        style={{ opacity: 0, maxWidth: "none" }}
      />
    </>
  );

  return {
    className: "timer-cursor",
    handlers: { onPointerMove, onPointerDown, onPointerLeave },
    dot: layer,
  };
}
