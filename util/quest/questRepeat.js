// 퀘스트 종류: 일반(한 번만) / 일일(매일 0시에 다시) / 주간(매주 월요일 0시에 다시) — 한국 시간
// 일일·주간 퀘스트는 칭호를 줄 수 없다 (매일 칭호가 쌓이지 않게)
export const QUEST_REPEATS = [
  { key: "none", label: "일반", badge: null },
  { key: "daily", label: "일일", badge: "🔁 일일" },
  { key: "weekly", label: "주간", badge: "🔁 주간" },
];

export const normalizeRepeat = (v) => (v === "daily" || v === "weekly" ? v : "none");
export const isRepeating = (quest) => normalizeRepeat(quest?.repeat) !== "none";
export const repeatBadge = (quest) => QUEST_REPEATS.find((r) => r.key === normalizeRepeat(quest?.repeat))?.badge ?? null;
