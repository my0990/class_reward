// 퀘스트 종류: 일반(한 번만) / 일일(매일 0시에 다시) / 주간(매주 월요일 0시에 다시) — 한국 시간
// 일일·주간 퀘스트는 칭호를 줄 수 없다 (매일 칭호가 쌓이지 않게)
export const QUEST_REPEATS = [
  { key: "none", label: "일반", badge: null },
  { key: "daily", label: "일일", badge: "☀️ 일일" },
  { key: "weekly", label: "주간", badge: "📅 주간" },
];

// 화면에서 종류별로 나눠 보여줄 때 (선생님 퀘스트 관리, 키오스크): 일일 → 주간 → 일반 순서
export const REPEAT_SECTIONS = [
  { key: "daily", title: "☀️ 일일 퀘스트", hint: "매일 0시에 다시 할 수 있어요" },
  { key: "weekly", title: "📅 주간 퀘스트", hint: "매주 월요일 0시에 다시 할 수 있어요" },
  { key: "none", title: "🏆 퀘스트", hint: "한 번만 할 수 있어요" },
];

// 종류별 색 (Tailwind가 찾을 수 있게 클래스 이름을 통째로 적는다)
export const REPEAT_COLORS = {
  daily: { border: "border-sky-400", hover: "hover:border-sky-600", badge: "bg-sky-100 text-sky-700", title: "text-sky-800", line: "border-sky-400" },
  weekly: { border: "border-violet-400", hover: "hover:border-violet-600", badge: "bg-violet-100 text-violet-700", title: "text-violet-800", line: "border-violet-400" },
  none: { border: "border-orange-500", hover: "hover:border-orange-600", badge: "bg-orange-100 text-orange-700", title: "text-red-900", line: "border-orange-500" },
};

export const normalizeRepeat = (v) => (v === "daily" || v === "weekly" ? v : "none");
export const isRepeating = (quest) => normalizeRepeat(quest?.repeat) !== "none";
export const repeatBadge = (quest) => QUEST_REPEATS.find((r) => r.key === normalizeRepeat(quest?.repeat))?.badge ?? null;

export const repeatColors = (quest) => REPEAT_COLORS[normalizeRepeat(quest?.repeat)];

/** 목록을 종류별로 나눈다 (순서는 그대로, 빈 종류는 뺌) → [{ key, title, hint, items }] */
export function groupByRepeat(list) {
  return REPEAT_SECTIONS.map((sec) => ({ ...sec, items: (list ?? []).filter((q) => normalizeRepeat(q?.repeat) === sec.key) })).filter(
    (sec) => sec.items.length > 0
  );
}
