// 키오스크 학생 카드: 레벨 · 잔액 · 프로필 · 번호/별명 · 칭호
import { getLevel } from "./kioskUtils";

export default function StudentCard({ user, currencyEmoji, startExp, commonDifference, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[160px] rounded-xl bg-orange-200 p-[16px] text-left transition-transform active:scale-95"
    >
      <div className="mb-[8px] flex justify-between">
        <div className="font-semibold">LV. {getLevel(user.exp, startExp, commonDifference)}</div>
        <div className="w-[80px] overflow-hidden whitespace-nowrap text-right">
          {currencyEmoji} {user.money}
        </div>
      </div>
      <div className="mx-auto mb-[8px] flex h-[110px] w-[110px] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white">
        <img src={user.profileUrl} width="100" height="100" alt="" className="rounded-full" />
      </div>
      <div className="overflow-hidden text-center text-[1rem] font-bold">
        {user.classNumber}. {user.profileNickname}
      </div>
      <div className="flex items-center justify-center rounded-lg bg-white">{user.profileTitle}</div>
    </button>
  );
}
