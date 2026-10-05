// 거래 내역 날짜를 읽기 쉽게
//   오늘 14:03 / 어제 09:15 / 10월 3일 (금) 13:20 / 2025년 12월 3일 13:20 (다른 해)
// 마우스를 올리면 보이는 전체 시각은 formatFullDate.

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n) => String(n).padStart(2, "0");

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayDiff(a, b) {
  const startA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const startB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((startB - startA) / 86400000);
}

/** 날짜와 시간을 따로 돌려준다 (표에서 두 줄로 보여주기용) */
export function formatHistoryDateParts(value, now = new Date()) {
  const d = toDate(value);
  if (!d) return { day: "-", time: "" };

  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const diff = dayDiff(d, now);

  let day;
  if (diff === 0) day = "오늘";
  else if (diff === 1) day = "어제";
  else if (d.getFullYear() !== now.getFullYear()) day = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  else day = `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;

  return { day, time };
}

export function formatHistoryDate(value, now = new Date()) {
  const { day, time } = formatHistoryDateParts(value, now);
  return time ? `${day} ${time}` : day;
}

export function formatFullDate(value) {
  const d = toDate(value);
  if (!d) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
