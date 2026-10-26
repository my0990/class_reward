"use client";
// 대시보드 '자리 배치' 보기: 자리 바꾸기에서 마지막으로 저장한 자리 그대로 학생 카드를 놓는다
// - view "teacher": 앞줄이 화면 아래 (교탁에서 반을 바라보는 방향) / "student": 앞줄이 위 (칠판 그림은 그리지 않음)
// - 통로는 빈칸, 카드는 화면 폭에 맞춰 줄어듦 (작아지면 사진·번호·별명·잔액만)
// - 자리 없는 학생(자리 저장 뒤 새로 만든 학생 등)은 맨 아래 '자리 없음'에 모음
import { profileImgProps } from "@/util/image/profileImage";
import { seatId } from "@/util/seat/seatAlgorithm";
import TruncText from "@/components/ui/common/TruncText";

function SeatCard({ student, isActive, onClick, currencyEmoji }) {
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };
  return (
    <div
      role="button"
      tabIndex={0}
      data-select-id={student.userId}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`flex w-full cursor-pointer select-none flex-col items-center rounded-xl p-[7%] transition [container-type:inline-size] hover:-translate-y-[2px] hover:shadow-lg ${
        isActive ? "bg-orange-500 text-white" : "bg-orange-200 text-gray-800 hover:bg-orange-300"
      }`}
    >
      <div className="aspect-square w-[62%] overflow-hidden rounded-full border-[3px] border-white bg-white">
        <img {...profileImgProps(student.profileUrl, 100)} width="100" height="100" alt="" className="h-full w-full object-cover" />
      </div>
      <TruncText className="mt-[6%] w-full text-center text-[clamp(10px,11cqw,17px)] font-bold leading-tight">
        {student.classNumber}. {student.profileNickname}
      </TruncText>
      <TruncText
        className={`w-full text-center text-[clamp(9px,9.5cqw,15px)] leading-tight ${
          Number(student.money) < 0 ? `font-bold ${isActive ? "text-red-800" : "text-red-600"}` : ""
        }`}
      >
        {currencyEmoji} {student.money}
      </TruncText>
    </div>
  );
}

export default function SeatLayoutView({ layout, assignment = {}, students = [], view = "teacher", isActive, onToggle, currencyEmoji }) {
  const byId = new Map(students.map((s) => [String(s.userId), s]));
  const teacher = view === "teacher";
  const rows = [...Array(layout.rows).keys()];
  const cols = [...Array(layout.cols).keys()];
  const rowOrder = teacher ? [...rows].reverse() : rows;
  const colOrder = teacher ? [...cols].reverse() : cols;
  const seated = new Set(Object.values(assignment).map(String));
  const unseated = students.filter((s) => !seated.has(String(s.userId)));

  return (
    <div className="flex flex-col gap-[20px]">
      <div
        className="mx-auto grid w-full gap-[10px]"
        // 책상이 하나도 없는 세로줄(통로)은 좁게 → 카드를 더 크게
        style={{
          gridTemplateColumns: colOrder
            .map((c) => (rows.some((r) => layout.desks?.[r]?.[c]) ? "minmax(0, 150px)" : "minmax(12px, 40px)"))
            .join(" "),
          justifyContent: "center",
        }}
      >
        {rowOrder.map((r) =>
          colOrder.map((c) => {
            const key = `${r}-${c}`;
            if (!layout.desks?.[r]?.[c]) return <div key={key} aria-hidden="true" />; // 통로
            const s = byId.get(String(assignment[seatId(r, c)] ?? ""));
            if (!s) return <div key={key} aria-hidden="true" className="min-h-[60px] rounded-xl border-2 border-dashed border-orange-200" />; // 빈 책상
            return <SeatCard key={key} student={s} isActive={isActive(s)} onClick={() => onToggle(s)} currencyEmoji={currencyEmoji} />;
          })
        )}
      </div>

      {unseated.length > 0 && (
        <div className="mt-[8px]">
          <div className="mb-[8px] text-[0.95rem] font-semibold text-gray-600">자리 없음 ({unseated.length}명)</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,120px))] gap-[10px]">
            {unseated.map((s) => (
              <SeatCard key={s.userId} student={s} isActive={isActive(s)} onClick={() => onToggle(s)} currencyEmoji={currencyEmoji} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
