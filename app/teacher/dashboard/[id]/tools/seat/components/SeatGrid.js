"use client";
// 교실 자리 그림: 교탁 + 책상 격자 (짝끼리 붙이고 짝 사이는 통로처럼 띄움)
// view = "student"(교탁이 위, 학생이 칠판을 보는 방향) | "teacher"(교탁이 아래, 교탁에서 본 방향)
import { seatId } from "@/util/seat/seatAlgorithm";

// paintable: 교실 배치 편집용 (칸을 div로 그리고 data-seat를 달아 부모가 드래그로 칠한다)
export default function SeatGrid({ layout, assignment = {}, students = {}, view = "student", onSeatClick, hiddenSeats, size = "md", paintable = false }) {
  const rows = [...Array(layout.rows).keys()];
  const cols = [...Array(layout.cols).keys()];
  const teacher = view === "teacher";
  const rowOrder = teacher ? [...rows].reverse() : rows;
  const colOrder = teacher ? [...cols].reverse() : cols;
  const cell = size === "sm" ? "h-[52px] w-[72px] text-[0.8rem]" : "h-[72px] w-[104px] text-[1rem]";

  const desk = <div className="mx-auto w-[220px] rounded-lg bg-amber-700 py-2 text-center font-bold text-white">교탁</div>;

  return (
    <div className="inline-flex flex-col gap-4">
      {!teacher && desk}
      <div className="flex flex-col gap-2">
        {rowOrder.map((r) => (
          <div key={r} className="flex">
            {colOrder.map((c, i) => {
              const id = seatId(r, c);
              const isDesk = layout.desks[r][c];
              const userId = assignment[id];
              const s = userId ? students[userId] : null;
              const hidden = hiddenSeats?.has(id);
              // 짝(0-1, 2-3…) 사이는 붙이고, 짝과 짝 사이는 넓게
              const gap = i < colOrder.length - 1 ? (Math.min(c, colOrder[i + 1]) % 2 === 0 ? "mr-[2px]" : "mr-[16px]") : "";
              return (
                <Cell
                  key={c}
                  paintable={paintable}
                  data-seat={id}
                  disabled={!onSeatClick}
                  onClick={() => onSeatClick?.(id)}
                  className={`${cell} ${gap} flex flex-col items-center justify-center rounded-lg border-2 leading-tight transition
                    ${!isDesk ? "border-dashed border-gray-200 bg-transparent text-gray-300" : hidden ? "border-orange-300 bg-orange-300 text-white" : s ? "border-orange-300 bg-orange-100 text-gray-800" : "border-orange-200 bg-white text-gray-400"}
                    ${paintable ? "cursor-pointer select-none" : onSeatClick ? "cursor-pointer hover:scale-105" : "cursor-default"}`}
                >
                  {!isDesk ? "통로" : hidden ? <span className="text-2xl">?</span> : s ? (
                    <>
                      <span className="text-[0.75em] text-orange-500">{s.classNumber}번</span>
                      <span className="max-w-full truncate px-1 font-bold">{s.profileNickname}</span>
                    </>
                  ) : (
                    "책상"
                  )}
                </Cell>
              );
            })}
          </div>
        ))}
      </div>
      {teacher && desk}
    </div>
  );
}

/** "0-1" → "1줄 2칸" */
export const seatLabel = (id) => {
  const [r, c] = String(id).split("-").map(Number);
  return `${r + 1}줄 ${c + 1}칸`;
};

// 편집(드래그) 모드는 div, 보통은 button
function Cell({ paintable, disabled, onClick, children, ...rest }) {
  if (paintable) return <div {...rest}>{children}</div>;
  return (
    <button type="button" disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
