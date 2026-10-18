"use client";
// 교실 배치: 크기 고르기 격자 하나로 줄·칸 수와 통로(선택 해제)를 함께 정한다 (SizePicker)
import SizePicker from "./SizePicker";

export default function LayoutEditor({ layout, setLayout, studentCount, isNew = false }) {
  const resize = (rows, cols) => {
    const desks = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => layout.desks?.[r]?.[c] ?? true));
    setLayout({ rows, cols, desks });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h3 className="text-[1.2rem] font-bold">{isNew ? "교실 크기를 정해 주세요" : "교실 크기"}</h3>
        <p className="text-sm text-gray-500">
          한글에서 표 만들 때처럼 빈 칸을 누른 채로 원하는 크기까지 드래그하세요.
          <br />
          주황색(선택된) 칸에서 드래그하면 그 부분만 선택 해제(통로)되고, 해제된 칸에서 드래그하면 다시 책상이 됩니다.
        </p>
      </div>
      <SizePicker
        rows={layout.rows}
        cols={layout.cols}
        desks={layout.desks}
        onPick={resize}
        onDesks={(desks) => setLayout({ rows: layout.rows, cols: layout.cols, desks })}
        studentCount={studentCount}
      />
    </div>
  );
}
