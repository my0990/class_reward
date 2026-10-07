"use client";
// 교실 배치: 줄·칸 수 정하기 + 책상을 누르거나 드래그해서 켜기/끄기
// 처음 누른 칸이 책상이면 지나가는 칸을 모두 통로로, 통로면 모두 책상으로 칠한다 (마우스·터치 공용)
import { useRef } from "react";
import { LAYOUT_LIMITS, deskSeats } from "@/util/seat/seatAlgorithm";
import SeatGrid from "./SeatGrid";

const range = [...Array(LAYOUT_LIMITS.MAX - LAYOUT_LIMITS.MIN + 1).keys()].map((i) => i + LAYOUT_LIMITS.MIN);

export default function LayoutEditor({ layout, setLayout, studentCount }) {
  const resize = (rows, cols) => {
    const desks = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => layout.desks?.[r]?.[c] ?? true));
    setLayout({ rows, cols, desks });
  };
  const paint = useRef(null); // { value: true/false, desks } 드래그 중일 때만

  const seatAt = (e) => document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-seat]")?.getAttribute("data-seat");

  const apply = (id) => {
    const p = paint.current;
    if (!p || !id) return;
    const [r, c] = id.split("-").map(Number);
    if (p.desks[r][c] === p.value) return;
    p.desks = p.desks.map((row) => [...row]);
    p.desks[r][c] = p.value;
    setLayout({ ...layout, rows: layout.rows, cols: layout.cols, desks: p.desks });
  };

  const onPointerDown = (e) => {
    const id = seatAt(e);
    if (!id) return;
    e.preventDefault();
    const [r, c] = id.split("-").map(Number);
    paint.current = { value: !layout.desks[r][c], desks: layout.desks };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    apply(id);
  };
  const onPointerMove = (e) => {
    if (paint.current) apply(seatAt(e));
  };
  const endPaint = () => {
    paint.current = null;
  };
  const count = deskSeats(layout).length;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-4 text-[1.1rem]">
        <label className="flex items-center gap-2">
          줄
          <select className="select select-bordered select-sm" value={layout.rows} onChange={(e) => resize(Number(e.target.value), layout.cols)}>
            {range.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          칸
          <select className="select select-bordered select-sm" value={layout.cols} onChange={(e) => resize(layout.rows, Number(e.target.value))}>
            {range.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <span className={count < studentCount ? "font-bold text-red-500" : "text-gray-500"}>
          책상 {count}개 / 학생 {studentCount}명
        </span>
      </div>
      <p className="text-sm text-gray-500">책상을 누르거나 드래그하면 통로(빈칸)로, 통로에서 시작하면 책상으로 바뀝니다. 같은 줄의 1·2칸, 3·4칸…이 짝입니다.</p>
      <div
        className="max-w-full touch-none overflow-x-auto pb-2"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPaint}
        onPointerCancel={endPaint}
        onLostPointerCapture={endPaint}
      >
        <SeatGrid layout={layout} size="sm" paintable />
      </div>
    </div>
  );
}
