"use client";
// 교실 배치: 줄·칸 수 정하기 + 책상 눌러서 켜기/끄기
import { LAYOUT_LIMITS, deskSeats } from "@/util/seat/seatAlgorithm";
import SeatGrid from "./SeatGrid";

const range = [...Array(LAYOUT_LIMITS.MAX - LAYOUT_LIMITS.MIN + 1).keys()].map((i) => i + LAYOUT_LIMITS.MIN);

export default function LayoutEditor({ layout, setLayout, studentCount }) {
  const resize = (rows, cols) => {
    const desks = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => layout.desks?.[r]?.[c] ?? true));
    setLayout({ rows, cols, desks });
  };
  const toggle = (id) => {
    const [r, c] = id.split("-").map(Number);
    const desks = layout.desks.map((row) => [...row]);
    desks[r][c] = !desks[r][c];
    setLayout({ ...layout, desks });
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
      <p className="text-sm text-gray-500">책상을 누르면 통로(빈칸)로, 다시 누르면 책상으로 바뀝니다. 같은 줄의 1·2칸, 3·4칸…이 짝입니다.</p>
      <div className="max-w-full overflow-x-auto pb-2">
        <SeatGrid layout={layout} onSeatClick={toggle} size="sm" />
      </div>
    </div>
  );
}
