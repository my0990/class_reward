// 관리자 대시보드 통계 — 개인 정보 없이 "개수"만 모은다 (교사 목록은 보여주지 않음)
import { connectDB } from "@/lib/mongodb";
import { EMAIL_LIMITS } from "@/server-action/service/auth/emailCode.service";
import { weekKey, weekKeyOfDay, monthKey } from "@/lib/stats/dailyUsage";

export const DASHBOARD_DAYS = 30;
export const USAGE_WEEKS = 12;
export const USAGE_MONTHS = 12;
const DAY = 24 * 60 * 60 * 1000;
const TZ = "Asia/Seoul";

/** now 기준 최근 n일의 한국 날짜 키 ["2026-09-06", ..., "2026-10-05"] */
export function lastDayKeys(now, n = DASHBOARD_DAYS) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  return Array.from({ length: n }, (_, i) => fmt.format(new Date(now.getTime() - (n - 1 - i) * DAY)));
}

const shiftDayKey = (key, days) => new Date(Date.parse(`${key}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);

/** 최근 n주의 월요일 키 (이번 주가 마지막) */
export function lastWeekKeys(now, n = USAGE_WEEKS) {
  const w = weekKey(now);
  return Array.from({ length: n }, (_, i) => shiftDayKey(w, -(n - 1 - i) * 7));
}

/** 최근 n달의 "YYYY-MM" (이번 달이 마지막) */
export function lastMonthKeys(now, n = USAGE_MONTHS) {
  const [y, m] = monthKey(now).split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const t = y * 12 + (m - 1) - (n - 1 - i);
    return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
  });
}

const USAGE_FIELDS = ["teachers", "students", "kioskUses"];

/**
 * 일·주·월별 이용 숫자. 기록을 시작하기 전 기간은 0이 아니라 null (그래프에서 비워 둠).
 * - 일별: daily_usage
 * - 주·월별 교사·학생: period_usage (그 기간에 접속한 '사람 수', 중복 없음)
 * - 주·월별 키오스크: 일별 사용 횟수의 합
 */
export function buildUsageSeries({ dayKeys, weekKeys, monthKeys, dailyDocs, periodDocs, firstDay }) {
  const daily = new Map(dailyDocs.map((d) => [d._id, d]));
  const period = new Map(periodDocs.map((d) => [d._id, d]));
  const kioskSum = new Map();
  for (const d of dailyDocs) {
    for (const k of [`w:${weekKeyOfDay(d._id)}`, `m:${d._id.slice(0, 7)}`]) {
      kioskSum.set(k, (kioskSum.get(k) ?? 0) + (d.kioskUses ?? 0));
    }
  }

  const day = dayKeys.map((key) => {
    const tracked = firstDay != null && key >= firstDay;
    const doc = daily.get(key);
    return { key, ...Object.fromEntries(USAGE_FIELDS.map((f) => [f, tracked ? doc?.[f] ?? 0 : null])) };
  });

  const byPeriod = (prefix, keys, firstKey) =>
    keys.map((key) => {
      const doc = period.get(`${prefix}:${key}`);
      const kioskTracked = firstKey != null && key >= firstKey;
      return {
        key,
        teachers: doc ? doc.teachers ?? 0 : null,
        students: doc ? doc.students ?? 0 : null,
        kioskUses: kioskTracked ? kioskSum.get(`${prefix}:${key}`) ?? 0 : null,
      };
    });

  return {
    day,
    week: byPeriod("w", weekKeys, firstDay && weekKeyOfDay(firstDay)),
    month: byPeriod("m", monthKeys, firstDay && firstDay.slice(0, 7)),
  };
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
  const weekKeys = lastWeekKeys(now);
  const monthKeys = lastMonthKeys(now);
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
    dailyDocs,
    firstDailyDoc,
    periodDocs,
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
    // 이용 숫자 (lib/stats/dailyUsage가 쌓는 숫자). 12달치여도 문서 365개 이하
    admins.collection("daily_usage").find({ _id: { $gte: `${monthKeys[0]}-01` } }).toArray(),
    admins.collection("daily_usage").find({}, { projection: { _id: 1 } }).sort({ _id: 1 }).limit(1).toArray(),
    admins
      .collection("period_usage")
      .find({ _id: { $in: [...weekKeys.map((k) => `w:${k}`), ...monthKeys.map((k) => `m:${k}`)] } })
      .toArray(),
  ]);

  return {
    generatedAt: now.toISOString(),
    totals: { teachers, students, activeClasses, trashedClasses, notices },
    active: { teachers7d: activeTeachers7d, teachers30d: activeTeachers30d, students7d: activeStudents7d },
    email: { last24h: emailsLast24h, dailyLimit: EMAIL_LIMITS.GLOBAL_PER_DAY },
    signupsByDay,
    historyByDay,
    usage: buildUsageSeries({
      dayKeys: keys,
      weekKeys,
      monthKeys,
      dailyDocs,
      periodDocs,
      firstDay: firstDailyDoc[0]?._id ?? null,
    }),
    recentAudit: recentAudit.map((a) => ({
      _id: a._id.toString(),
      at: new Date(a.at).toISOString(),
      adminEmail: a.adminEmail,
      action: a.action,
      detail: a.detail ?? null,
    })),
  };
}
