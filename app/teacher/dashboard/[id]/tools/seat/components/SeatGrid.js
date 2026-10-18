"use client";
// 교실 자리 그림: 교탁 + 책상 격자 (책상 사이 간격은 가로·세로 모두 같게)
// view = "student"(교탁이 위, 학생이 칠판을 보는 방향) | "teacher"(교탁이 아래, 교탁에서 본 방향)
import { seatId } from "@/util/seat/seatAlgorithm";

// paintable: 교실 배치 편집용 (칸을 div로 그리고 data-seat를 달아 부모가 드래그로 칠한다)
export default function SeatGrid({ layout, assignment = {}, students = {}, view = "student", onSeatClick, hiddenSeats, size = "md", paintable = false }) {
  const rows = [...Array(layout.rows).keys()];
  const cols = [...Array(layout.cols).keys()];
  const teacher = view === "teacher";
  const rowOrder = teacher ? [...rows].reverse() : rows;
  const colOrder = teacher ? [...cols].reverse() : cols;
  // fit: 부모(container-type:size)의 너비·높이 둘 다에 맞춰 칸 크기를 정한다 → 한 화면에 다 보임 (최대 200px)
  // 세로 = 줄 수 × 칸 높이(0.66) + 줄 간격(0.08) + 교탁·간격(약 0.45) (모두 칸 너비 배율)
  const fit = size === "fit";
  const GAP = 0.08; // 책상 사이 간격 (칸 너비 배율, fit일 때)
  const gapCls = fit ? "gap-[calc(var(--cell)*0.08)]" : "gap-2";
  const cell = fit ? "" : size === "sm" ? "h-[52px] w-[72px] text-[0.8rem]" : "h-[72px] w-[104px] text-[1rem]";
  const cellStyle = fit ? { width: "var(--cell)", height: "calc(var(--cell) * 0.66)", fontSize: "calc(var(--cell) * 0.16)" } : undefined;
  const widthUnits = layout.cols + (layout.cols - 1) * GAP;
  const heightUnits = layout.rows * 0.66 + (layout.rows - 1) * GAP + 0.45;
  const rootStyle = fit
    ? { "--cell": `min(200px, calc(100cqw / ${widthUnits}), calc((100cqh - 8px) / ${heightUnits}))` }
    : undefined;

  const desk = (
    <div
      className={`mx-auto rounded-lg bg-amber-700 text-center font-bold text-white ${fit ? "leading-none" : "w-[220px] py-2"}`}
      style={fit ? { width: "calc(var(--cell) * 2)", padding: "calc(var(--cell) * 0.07) 0", fontSize: "calc(var(--cell) * 0.15)" } : undefined}
    >
      교탁
    </div>
  );

  return (
    <div className={`inline-flex flex-col ${fit ? "gap-[calc(var(--cell)*0.12)]" : "gap-4"}`} style={rootStyle}>
      {!teacher && desk}
      <div className={`flex flex-col ${gapCls}`}>
        {rowOrder.map((r) => (
          <div key={r} className={`flex ${gapCls}`}>
            {colOrder.map((c) => {
              const id = seatId(r, c);
              const isDesk = layout.desks[r][c];
              const userId = assignment[id];
              const s = userId ? students[userId] : null;
              const hidden = hiddenSeats?.has(id);
              return (
                <Cell
                  key={c}
                  paintable={paintable}
                  data-seat={id}
                  disabled={!onSeatClick}
                  onClick={() => onSeatClick?.(id)}
                  style={cellStyle}
                  className={`${cell} flex flex-col items-center justify-center rounded-lg border-2 leading-tight transition
                    ${!isDesk ? "border-dashed border-gray-200 bg-transparent text-gray-300" : hidden ? "border-orange-300 bg-orange-300 text-white" : s ? "border-orange-300 bg-orange-100 text-gray-800" : "border-orange-200 bg-white text-gray-400"}
                    ${paintable ? "cursor-pointer select-none" : onSeatClick ? "cursor-pointer hover:scale-105" : "cursor-default"}`}
                >
                  {!isDesk ? "통로" : hidden ? <span className="text-[1.6em]">?</span> : s ? (
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
