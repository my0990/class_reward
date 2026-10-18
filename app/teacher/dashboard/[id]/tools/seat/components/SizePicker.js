"use client";
// 교실 배치: 10×10 격자에서 책상이 있는 칸을 고른다. 칸은 '선택(책상)' 아니면 '선택 안 됨' 둘 중 하나.
// 누른 채로 드래그하면 처음 칸~지금 칸 사각형이 한 번에 바뀐다
// (선택 안 된 칸에서 시작 → 선택, 선택된 칸에서 시작 → 해제). 범위를 줄이면 빠진 칸은 드래그 전 상태로.
// 저장할 때는 선택된 칸을 감싸는 가장 작은 사각형으로 잘라서 layout {rows, cols, desks}로 넘긴다
// → 자리 바꾸기 화면은 선택된 책상 배치 그대로 보여 준다 (안 쓰는 줄·칸은 사라짐).
import { useRef, useState } from "react";
import { LAYOUT_LIMITS } from "@/util/seat/seatAlgorithm";

const N = LAYOUT_LIMITS.MAX;

/** N×N 격자(왼쪽 위에 layout을 놓음) */
export function toGrid(layout) {
  return Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => Boolean(layout?.desks?.[r]?.[c])));
}

/** 선택된 칸을 감싸는 사각형으로 자른 layout (아무것도 없으면 1×1 빈칸) */
export function cropGrid(grid) {
  let [r0, r1, c0, c1] = [N, -1, N, -1];
  grid.forEach((row, r) =>
    row.forEach((v, c) => {
      if (!v) return;
      r0 = Math.min(r0, r);
      r1 = Math.max(r1, r);
      c0 = Math.min(c0, c);
      c1 = Math.max(c1, c);
    }),
  );
  if (r1 < 0) return { rows: 1, cols: 1, desks: [[false]] };
  const desks = grid.slice(r0, r1 + 1).map((row) => row.slice(c0, c1 + 1));
  return { rows: desks.length, cols: desks[0].length, desks };
}

export default function SizePicker({ layout, onChange, studentCount }) {
  // 편집 중에는 격자를 그대로 들고 있는다 (잘라낸 결과로 다시 그리면 칸이 밀려 보임)
  const [grid, setGrid] = useState(() => toGrid(layout));
  const drag = useRef(null); // { start, value, snapshot, last }

  const cellAt = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-cell]");
    return el ? el.getAttribute("data-cell").split("-").map(Number) : null;
  };

  const apply = (at) => {
    const d = drag.current;
    if (!d || !at) return;
    const key = at.join("-");
    if (d.last === key) return;
    d.last = key;
    const [rMin, rMax] = [Math.min(d.start[0], at[0]), Math.max(d.start[0], at[0])];
    const [cMin, cMax] = [Math.min(d.start[1], at[1]), Math.max(d.start[1], at[1])];
    const next = d.snapshot.map((row, r) => row.map((v, c) => (r >= rMin && r <= rMax && c >= cMin && c <= cMax ? d.value : v)));
    setGrid(next);
    onChange(cropGrid(next));
  };

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const at = cellAt(e);
    if (!at) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { start: at, value: !grid[at[0]][at[1]], snapshot: grid, last: null };
    apply(at);
  };
  const onPointerMove = (e) => {
    if (drag.current) apply(cellAt(e)); // 누른 채로 움직일 때만
  };
  const end = () => {
    drag.current = null;
  };

  const count = grid.flat().filter(Boolean).length;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="grid touch-none select-none gap-[3px] rounded-lg border border-orange-200 bg-white p-2"
        style={{ gridTemplateColumns: `repeat(${N}, 26px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
        role="grid"
        aria-label="책상 배치 고르기"
      >
        {grid.flatMap((row, r) =>
          row.map((on, c) => (
            <div
              key={`${r}-${c}`}
              data-cell={`${r}-${c}`}
              className={`h-[26px] w-[26px] cursor-pointer rounded-[4px] border ${on ? "border-orange-500 bg-orange-400" : "border-gray-200 bg-gray-50"}`}
            />
          )),
        )}
      </div>
      <div className={`text-[1.1rem] font-bold ${count < studentCount ? "text-red-500" : "text-orange-700"}`}>
        책상 {count}개 <span className="font-normal text-gray-500">/ 학생 {studentCount}명</span>
      </div>
    </div>
  );
}
