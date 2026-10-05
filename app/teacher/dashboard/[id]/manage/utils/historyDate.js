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

export function formatHistoryDate(value, now = new Date()) {
  const d = toDate(value);
  if (!d) return "-";

  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const diff = dayDiff(d, now);

  if (diff === 0) return `오늘 ${time}`;
  if (diff === 1) return `어제 ${time}`;
  if (d.getFullYear() !== now.getFullYear()) {
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${time}`;
  }
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]}) ${time}`;
}

export function formatFullDate(value) {
  const d = toDate(value);
  if (!d) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
