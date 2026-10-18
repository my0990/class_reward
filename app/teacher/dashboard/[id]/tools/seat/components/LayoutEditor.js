"use client";
// 교실 배치: 10×10 격자에서 책상 칸을 고른다 (SizePicker). 자리 바꾸기는 고른 책상 모양 그대로 보여 준다.
import SizePicker from "./SizePicker";

export default function LayoutEditor({ layout, setLayout, studentCount, isNew = false }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h3 className="text-[1.2rem] font-bold">{isNew ? "책상 배치를 정해 주세요" : "책상 배치"}</h3>
        <p className="text-sm text-gray-500">
          칸을 누르거나 누른 채로 드래그해서 책상을 놓으세요. 이미 놓인 책상에서 드래그하면 그 부분이 지워집니다.
          <br />
          위쪽이 교탁 쪽입니다.
        </p>
      </div>
      <SizePicker layout={layout} onChange={setLayout} studentCount={studentCount} />
    </div>
  );
}
