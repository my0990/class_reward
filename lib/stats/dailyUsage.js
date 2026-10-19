// 관리자 대시보드용 일별 이용 수 (개인 정보 없이 날짜별 '숫자'만 저장)
// admins.daily_usage: { _id: "2026-10-19"(한국 날짜), teachers, students, kioskUses }
// - teachers / students: 그날 처음 접속한 사람 수 (같은 사람이 여러 번 들어와도 하루 1번)
//   → users.lastSeenAt을 갱신하기 '전' 값이 오늘이 아니면 오늘 첫 접속으로 센다. 누가 접속했는지는 남기지 않는다.
// - kioskUses: 키오스크에서 학생이 비밀번호를 맞힌 횟수 (= 키오스크 사용 횟수)
import { connectDB } from "@/lib/mongodb";

const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" });

/** 한국 날짜 키 "YYYY-MM-DD" */
export const dayKey = (date) => fmt.format(new Date(date));

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

/** lastSeenAt을 지금으로 바꾸고, 오늘 첫 접속이면 숫자 +1. 바꾸기 전 문서(projection)를 돌려준다 */
export async function touchLastSeen(usersCol, filter, { role, projection = {}, now = new Date() } = {}) {
  const before = await usersCol.findOneAndUpdate(filter, { $set: { lastSeenAt: now } }, { projection: { ...projection, lastSeenAt: 1 } });
  if (before && isFirstVisitToday(before.lastSeenAt, now)) await bumpDailyUsage(role, now);
  return before;
}
