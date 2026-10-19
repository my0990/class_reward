"use client";
// 그룹 자리 고르기: 교실 배치(책상) 위에서 누르거나 사각형으로 드래그
// 고르지 않은 칸에서 시작 → 범위를 고름, 고른 칸에서 시작 → 범위를 뺌 (책상 없는 칸은 건너뜀)
import { useRef } from "react";
import { seatId } from "@/util/seat/seatAlgorithm";

export default function GroupSeatPicker({ layout, seats, color, onChange }) {
  const drag = useRef(null); // { start, value, snapshot: Set, last }
  const picked = new Set(seats);

  const cellAt = (e) => document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-gseat]")?.getAttribute("data-gseat");

  const apply = (id) => {
    const d = drag.current;
    if (!d || !id || d.last === id) return;
    d.last = id;
    const [r2, c2] = id.split("-").map(Number);
    const [r1, c1] = d.start;
    const next = new Set(d.snapshot);
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++)
      for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
        if (!layout.desks[r]?.[c]) continue;
        if (d.value) next.add(seatId(r, c));
        else next.delete(seatId(r, c));
      }
    onChange([...next]);
  };

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const id = cellAt(e);
    if (!id) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { start: id.split("-").map(Number), value: !picked.has(id), snapshot: picked, last: null };
    apply(id);
  };
  const end = () => {
    drag.current = null;
  };

  return (
    <div
      className="inline-grid touch-none select-none gap-[3px] rounded-lg bg-gray-50 p-2"
      style={{ gridTemplateColumns: `repeat(${layout.cols}, 24px)` }}
      onPointerDown={onPointerDown}
      onPointerMove={(e) => drag.current && apply(cellAt(e))}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      role="grid"
      aria-label="그룹 자리 고르기"
    >
      {Array.from({ length: layout.rows }, (_, r) =>
        Array.from({ length: layout.cols }, (_, c) => {
          const id = seatId(r, c);
          if (!layout.desks[r][c]) return <div key={id} className="h-[24px] w-[24px]" />; // 통로
          const on = picked.has(id);
          return (
            <div
              key={id}
              data-gseat={id}
              className="h-[24px] w-[24px] cursor-pointer rounded-[4px] border"
              style={on ? { background: color, borderColor: color } : { background: "#fff", borderColor: "#fdba74" }}
            />
          );
        }),
      )}
    </div>
  );
}
