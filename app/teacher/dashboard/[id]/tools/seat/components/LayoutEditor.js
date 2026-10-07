"use client";
// 교실 배치: 줄·칸 수 정하기 + 책상을 누르거나 드래그해서 켜기/끄기
// 엑셀처럼 처음 누른 칸 ~ 지금 칸의 '사각형' 범위를 한 번에 바꾼다 (마우스·터치 공용).
// 처음 칸이 책상이면 범위를 통로로, 통로면 책상으로. 범위를 줄이면 빠진 칸은 드래그 전 상태로 돌아간다.
import { useRef } from "react";
import { LAYOUT_LIMITS, deskSeats } from "@/util/seat/seatAlgorithm";
import SeatGrid from "./SeatGrid";

const range = [...Array(LAYOUT_LIMITS.MAX - LAYOUT_LIMITS.MIN + 1).keys()].map((i) => i + LAYOUT_LIMITS.MIN);

export default function LayoutEditor({ layout, setLayout, studentCount }) {
  const resize = (rows, cols) => {
    const desks = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => layout.desks?.[r]?.[c] ?? true));
    setLayout({ rows, cols, desks });
  };
  const drag = useRef(null); // { start: [r,c], value, snapshot } 드래그 중일 때만

  const seatAt = (e) => document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-seat]")?.getAttribute("data-seat");

  // 드래그 시작 전 배치(snapshot)에서, 시작 칸~지금 칸 사각형만 value로 바꾼 배치
  const applyRect = (id) => {
    const d = drag.current;
    if (!d || !id) return;
    const [r2, c2] = id.split("-").map(Number);
    if (d.last === id) return;
    d.last = id;
    const [r1, c1] = d.start;
    const [rMin, rMax] = [Math.min(r1, r2), Math.max(r1, r2)];
    const [cMin, cMax] = [Math.min(c1, c2), Math.max(c1, c2)];
    const desks = d.snapshot.map((row, r) => row.map((v, c) => (r >= rMin && r <= rMax && c >= cMin && c <= cMax ? d.value : v)));
    setLayout({ rows: layout.rows, cols: layout.cols, desks });
  };

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return; // 왼쪽 버튼만
    const id = seatAt(e);
    if (!id) return;
    e.preventDefault();
    const [r, c] = id.split("-").map(Number);
    drag.current = { start: [r, c], value: !layout.desks[r][c], snapshot: layout.desks, last: null };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    applyRect(id);
  };
  const onPointerMove = (e) => {
    if (drag.current) applyRect(seatAt(e));
  };
  const endDrag = () => {
    drag.current = null;
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
      <p className="text-sm text-gray-500">누르거나 사각형으로 드래그하면 그 범위가 통로(빈칸)로, 통로에서 시작하면 책상으로 바뀝니다. 같은 줄의 1·2칸, 3·4칸…이 짝입니다.</p>
      <div
        className="max-w-full touch-none overflow-x-auto pb-2"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <SeatGrid layout={layout} size="sm" paintable />
      </div>
    </div>
  );
}
