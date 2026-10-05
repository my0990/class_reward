// 거래 내역 한 줄이 어떤 종류인지 (화면 표시용)
// 새 기록은 kind 필드로, 예전 기록은 이름/입출금 종류로 판단한다.
//   지급(선생님이 줌) · 퀘스트 보상 · 구입 · 기부 · 회수(선생님이 가져감) · 아이템 사용

export const HISTORY_KINDS = {
  grant: { label: "지급", icon: "🎁", row: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700" },
  quest: { label: "퀘스트", icon: "🏆", row: "bg-lime-50", badge: "bg-lime-100 text-lime-700" },
  buy: { label: "구입", icon: "🛒", row: "bg-rose-50", badge: "bg-rose-100 text-rose-700" },
  donate: { label: "기부", icon: "💝", row: "bg-sky-50", badge: "bg-sky-100 text-sky-700" },
  take: { label: "회수", icon: "↩️", row: "bg-gray-100", badge: "bg-gray-200 text-gray-700" },
  use: { label: "사용", icon: "✨", row: "bg-amber-50", badge: "bg-amber-100 text-amber-700" },
  income: { label: "입금", icon: "➕", row: "", badge: "bg-emerald-100 text-emerald-700" },
  spend: { label: "출금", icon: "➖", row: "", badge: "bg-rose-100 text-rose-700" },
};

export function isDepositType(type) {
  // 예전 데이터에는 "deposit"/"withDrawal"이, 지금 데이터에는 "입금"/"출금"이 섞여 있다.
  return type === "입금" || type === "deposit";
}

export function getHistoryKind(item) {
  const name = String(item?.name ?? "");

  if (item?.kind === "itemUse" || name.startsWith("아이템 사용")) return "use";
  if (name === "기부") return "donate";
  if (name === "퀘스트 완료") return "quest";
  if (name === "선생님에게 받음") return "grant";
  if (name === "선생님에게 뺏김") return "take";
  if (name === "프로필 구입" || name.endsWith(" 구입")) return "buy";

  return isDepositType(item?.type) ? "income" : "spend";
}
