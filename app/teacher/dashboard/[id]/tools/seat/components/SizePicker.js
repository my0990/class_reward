"use client";
// 교실 크기 고르기: 한글(HWP)에서 표 만들 때처럼 작은 칸 격자를 드래그해서 정한다.
// - 선택 범위 '밖'에서 누르고 드래그 → 왼쪽 위부터 "줄 × 칸" 크기를 정함 (손을 떼면 확정)
// - 선택 범위 '안'(주황 칸)에서 누르고 드래그 → 그 사각형을 선택 해제(통로)
//   해제된 칸에서 시작하면 다시 책상으로. 범위를 줄이면 빠진 칸은 드래그 전 상태로 돌아간다.
import { useRef, useState } from "react";
import { LAYOUT_LIMITS } from "@/util/seat/seatAlgorithm";

const N = LAYOUT_LIMITS.MAX;

export default function SizePicker({ rows, cols, desks, onPick, onDesks, studentCount }) {
  const [hover, setHover] = useState(null); // [rows, cols] 크기 미리보기
  const mode = useRef(null); // null | { type: "resize" } | { type: "paint", start, value, snapshot, last }
  const [r, c] = hover ?? [rows, cols];

  const cellAt = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-size]");
    if (!el) return null;
    return el.getAttribute("data-size").split("x").map(Number);
  };

  // 드래그 시작 전(snapshot)에서 시작 칸~지금 칸 사각형만 value로 (지금 크기 안으로 제한)
  const paint = (at) => {
    const m = mode.current;
    if (!at || m?.type !== "paint") return;
    const r2 = Math.min(at[0], rows) - 1;
    const c2 = Math.min(at[1], cols) - 1;
    const key = `${r2}-${c2}`;
    if (m.last === key) return;
    m.last = key;
    const [r1, c1] = m.start;
    const [rMin, rMax] = [Math.min(r1, r2), Math.max(r1, r2)];
    const [cMin, cMax] = [Math.min(c1, c2), Math.max(c1, c2)];
    onDesks(m.snapshot.map((row, rr) => row.map((v, cc) => (rr >= rMin && rr <= rMax && cc >= cMin && cc <= cMax ? m.value : v))));
  };

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const at = cellAt(e);
    if (!at) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const inside = at[0] <= rows && at[1] <= cols;
    if (inside) {
      const start = [at[0] - 1, at[1] - 1];
      mode.current = { type: "paint", start, value: !desks[start[0]][start[1]], snapshot: desks, last: null };
      paint(at);
    } else {
      mode.current = { type: "resize" };
      setHover(at);
    }
  };
  const onPointerMove = (e) => {
    const m = mode.current;
    if (!m) return; // 누른 채로 움직일 때만
    const at = cellAt(e);
    if (m.type === "paint") paint(at);
    else if (at) setHover(at);
  };
  const onPointerUp = (e) => {
    const m = mode.current;
    mode.current = null;
    if (m?.type !== "resize") return;
    const at = cellAt(e) ?? hover;
    if (at) onPick(at[0], at[1]);
    setHover(null);
  };

  const deskCount = Array.from({ length: r }, (_, rr) => Array.from({ length: c }, (_, cc) => desks[rr]?.[cc] ?? true))
    .flat()
    .filter(Boolean).length;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="grid touch-none select-none gap-[3px] rounded-lg border border-orange-200 bg-white p-2"
        style={{ gridTemplateColumns: `repeat(${N}, 22px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          mode.current = null;
          setHover(null);
        }}
        role="grid"
        aria-label="교실 크기 고르기"
      >
        {Array.from({ length: N * N }, (_, i) => {
          const rr = Math.floor(i / N) + 1;
          const cc = (i % N) + 1;
          const inSize = rr <= r && cc <= c;
          const isDesk = desks[rr - 1]?.[cc - 1] ?? true; // 새로 늘어난 칸은 책상
          const cls = !inSize
            ? "border-gray-200 bg-gray-50"
            : isDesk
              ? "border-orange-500 bg-orange-400"
              : "border-dashed border-orange-300 bg-white";
          return <div key={i} data-size={`${rr}x${cc}`} className={`h-[22px] w-[22px] cursor-pointer rounded-[3px] border ${cls}`} />;
        })}
      </div>
      <div className="text-[1.1rem] font-bold text-orange-700">
        {r}줄 × {c}칸{" "}
        <span className={`font-normal ${deskCount < studentCount ? "text-red-500" : "text-gray-500"}`}>
          (책상 {deskCount}개 / 학생 {studentCount}명)
        </span>
      </div>
    </div>
  );
}
