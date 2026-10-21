// 관리자 대시보드용 일별 이용 수 (개인 정보 없이 날짜별 '숫자'만 저장)
// admins.daily_usage: { _id: "2026-10-19"(한국 날짜), teachers, students, kioskUses }
// - teachers / students: 그날 처음 접속한 사람 수 (같은 사람이 여러 번 들어와도 하루 1번)
//   → users.lastSeenAt을 갱신하기 '전' 값이 오늘이 아니면 오늘 첫 접속으로 센다. 누가 접속했는지는 남기지 않는다.
// - kioskUses: 키오스크에서 학생이 비밀번호를 맞힌 횟수 (= 키오스크 사용 횟수)
// admins.period_usage: { _id: "w:2026-10-19"(그 주 월요일) | "m:2026-10", teachers, students }
// - 그 주/그 달에 한 번 이상 접속한 사람 수. 일별 숫자를 더하면 같은 사람이 여러 번 세지므로 따로 센다.
import { connectDB } from "@/lib/mongodb";

const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" });

/** 한국 날짜 키 "YYYY-MM-DD" */
export const dayKey = (date) => fmt.format(new Date(date));

const DAY = 24 * 60 * 60 * 1000;

/** 날짜 키 "YYYY-MM-DD"가 속한 주의 월요일 키 */
export function weekKeyOfDay(key) {
  const d = new Date(`${key}T00:00:00Z`);
  const fromMonday = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - fromMonday * DAY).toISOString().slice(0, 10);
}

/** 한국 기준 그 주 월요일 "YYYY-MM-DD" */
export const weekKey = (date) => weekKeyOfDay(dayKey(date));

/** 한국 기준 "YYYY-MM" */
export const monthKey = (date) => dayKey(date).slice(0, 7);

/** 직전 접속(prev)이 오늘(now, 한국 날짜)이 아니면 true */
export const isFirstVisitToday = (prev, now = new Date()) => !prev || dayKey(prev) !== dayKey(now);

const FIELDS = { teacher: "teachers", student: "students", kiosk: "kioskUses" };
export const DAILY_USAGE_FIELDS = FIELDS;

/** 오늘 숫자 +1. 통계라서 실패해도 로그인·결제는 계속된다 */
export async function bumpDailyUsage(kind, now = new Date()) {
  const field = FIELDS[kind];
  if (!field) return;
  try {
    const db = (await connectDB).db("admins");
    await db.collection("daily_usage").updateOne({ _id: dayKey(now) }, { $inc: { [field]: 1 } }, { upsert: true });
  } catch (error) {
    console.error("bumpDailyUsage error:", error);
  }
}

/**
 * 직전 접속(prev) 뒤 처음 접속한 날/주/달이면 그 숫자 +1 (교사·학생만).
 * 같은 날 두 번째 접속이면 아무것도 세지 않는다.
 */
export async function bumpVisit(role, prev, now = new Date()) {
  const field = FIELDS[role];
  if (!field || role === "kiosk" || !isFirstVisitToday(prev, now)) return;
  await bumpDailyUsage(role, now);
  const ids = [];
  if (!prev || weekKey(prev) !== weekKey(now)) ids.push(`w:${weekKey(now)}`);
  if (!prev || monthKey(prev) !== monthKey(now)) ids.push(`m:${monthKey(now)}`);
  if (!ids.length) return;
  try {
    const col = (await connectDB).db("admins").collection("period_usage");
    await Promise.all(ids.map((_id) => col.updateOne({ _id }, { $inc: { [field]: 1 } }, { upsert: true })));
  } catch (error) {
    console.error("bumpVisit error:", error);
  }
}

/** lastSeenAt을 지금으로 바꾸고, 오늘/이번 주/이번 달 첫 접속이면 숫자 +1. 바꾸기 전 문서(projection)를 돌려준다 */
export async function touchLastSeen(usersCol, filter, { role, projection = {}, now = new Date() } = {}) {
  const before = await usersCol.findOneAndUpdate(filter, { $set: { lastSeenAt: now } }, { projection: { ...projection, lastSeenAt: 1 } });
  if (before) await bumpVisit(role, before.lastSeenAt, now);
  return before;
}
