"use client";
// 교실 크기 고르기: 한글(HWP)에서 표 만들 때처럼 작은 칸 격자를 드래그(또는 마우스를 올리고 클릭)해서
// 왼쪽 위부터 "줄 × 칸" 크기를 정한다. 손을 떼거나 클릭하면 그 크기로 확정.
import { useRef, useState } from "react";
import { LAYOUT_LIMITS } from "@/util/seat/seatAlgorithm";

const N = LAYOUT_LIMITS.MAX;

export default function SizePicker({ rows, cols, onPick, studentCount }) {
  const [hover, setHover] = useState(null); // [rows, cols] 미리보기
  const dragging = useRef(false);
  const [r, c] = hover ?? [rows, cols];

  const cellAt = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-size]");
    if (!el) return null;
    return el.getAttribute("data-size").split("x").map(Number);
  };

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const at = cellAt(e);
    if (!at) return;
    e.preventDefault();
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setHover(at);
  };
  const onPointerMove = (e) => {
    // 마우스는 누르지 않아도 올리기만 하면 미리보기 (한글 표 만들기처럼)
    if (!dragging.current && e.pointerType !== "mouse") return;
    const at = cellAt(e);
    if (at) setHover(at);
  };
  const onPointerUp = (e) => {
    const at = cellAt(e) ?? hover;
    dragging.current = false;
    if (at) onPick(at[0], at[1]);
    setHover(null);
  };

  const seats = r * c;
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="grid touch-none select-none gap-[3px] rounded-lg border border-orange-200 bg-white p-2"
        style={{ gridTemplateColumns: `repeat(${N}, 22px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => !dragging.current && setHover(null)}
        role="grid"
        aria-label="교실 크기 고르기"
      >
        {Array.from({ length: N * N }, (_, i) => {
          const rr = Math.floor(i / N) + 1;
          const cc = (i % N) + 1;
          const on = rr <= r && cc <= c;
          return (
            <div
              key={i}
              data-size={`${rr}x${cc}`}
              className={`h-[22px] w-[22px] cursor-pointer rounded-[3px] border ${on ? "border-orange-500 bg-orange-400" : "border-gray-200 bg-gray-50"}`}
            />
          );
        })}
      </div>
      <div className="text-[1.1rem] font-bold text-orange-700">
        {r}줄 × {c}칸 <span className={`font-normal ${seats < studentCount ? "text-red-500" : "text-gray-500"}`}>(책상 {seats}개 / 학생 {studentCount}명)</span>
      </div>
    </div>
  );
}
