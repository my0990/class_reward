// 관리자 대시보드 통계 — 개인 정보 없이 "개수"만 모은다 (교사 목록은 보여주지 않음)
import { connectDB } from "@/lib/mongodb";
import { EMAIL_LIMITS } from "@/server-action/service/auth/emailCode.service";

export const DASHBOARD_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;
const TZ = "Asia/Seoul";

/** now 기준 최근 n일의 한국 날짜 키 ["2026-09-06", ..., "2026-10-05"] */
export function lastDayKeys(now, n = DASHBOARD_DAYS) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  return Array.from({ length: n }, (_, i) => fmt.format(new Date(now.getTime() - (n - 1 - i) * DAY)));
}

/** 한국 날짜 key의 0시(UTC Date) */
function kstMidnight(key) {
  return new Date(`${key}T00:00:00+09:00`);
}

async function countByDay(col, field, keys, match = {}) {
  const rows = await col
    .aggregate([
      { $match: { ...match, [field]: { $gte: kstMidnight(keys[0]), $type: "date" } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: `$${field}`, timezone: TZ } }, n: { $sum: 1 } } },
    ])
    .toArray();
  const map = new Map(rows.map((r) => [r._id, r.n]));
  return keys.map((date) => ({ date, count: map.get(date) ?? 0 }));
}

export async function getDashboardStatsService({ now = new Date() } = {}) {
  const client = await connectDB;
  const users = client.db("user").collection("users");
  const data = client.db("data");
  const admins = client.db("admins");
  const keys = lastDayKeys(now);
  const since = (ms) => new Date(now.getTime() - ms);

  const [
    teachers,
    students,
    activeClasses,
    trashedClasses,
    activeTeachers7d,
    activeTeachers30d,
    activeStudents7d,
    emailsLast24h,
    notices,
    signupsByDay,
    historyByDay,
    recentAudit,
  ] = await Promise.all([
    users.countDocuments({ role: "teacher" }),
    users.countDocuments({ role: "student", disabled: { $ne: true } }),
    data.collection("classes").countDocuments({ deletedAt: { $exists: false } }),
    data.collection("classes").countDocuments({ deletedAt: { $exists: true } }),
    users.countDocuments({ role: "teacher", lastSeenAt: { $gte: since(7 * DAY) } }),
    users.countDocuments({ role: "teacher", lastSeenAt: { $gte: since(30 * DAY) } }),
    users.countDocuments({ role: "student", lastSeenAt: { $gte: since(7 * DAY) } }),
    client.db("user").collection("email_send_log").countDocuments({ sentAt: { $gte: since(DAY) } }),
    admins.collection("notices").countDocuments(),
    countByDay(users, "createdAt", keys, { role: "teacher" }),
    countByDay(data.collection("history"), "expiresAfter", keys),
    admins.collection("audit_log").find().sort({ at: -1 }).limit(10).toArray(),
  ]);

  return {
    generatedAt: now.toISOString(),
    totals: { teachers, students, activeClasses, trashedClasses, notices },
    active: { teachers7d: activeTeachers7d, teachers30d: activeTeachers30d, students7d: activeStudents7d },
    email: { last24h: emailsLast24h, dailyLimit: EMAIL_LIMITS.GLOBAL_PER_DAY },
    signupsByDay,
    historyByDay,
    recentAudit: recentAudit.map((a) => ({
      _id: a._id.toString(),
      at: new Date(a.at).toISOString(),
      adminEmail: a.adminEmail,
      action: a.action,
      detail: a.detail ?? null,
    })),
  };
}
