// 관리자 대시보드 '최근 에러': admins.error_logs를 에러 종류(fp)별로 묶어서 최근 순으로
// (기록하는 쪽: lib/errorLog/errorLog.js)
import { connectDB } from "@/lib/mongodb";
import { dayKey } from "@/lib/stats/dailyUsage";

const DAY = 24 * 60 * 60 * 1000;

/**
 * @param {{ db?: import("mongodb").Db, days?: number, limit?: number, now?: Date }} [p] db = "admins" DB
 */
export async function getRecentErrorsService({ db, days = 7, limit = 30, now = new Date() } = {}) {
  const col = (db ?? (await connectDB).db("admins")).collection("error_logs");
  const since = new Date(now.getTime() - days * DAY);

  const [groups, todayAgg, weekAgg] = await Promise.all([
    col
      .aggregate([
        { $match: { lastAt: { $gte: since } } },
        { $sort: { lastAt: -1 } },
        {
          $group: {
            _id: "$fp",
            count: { $sum: "$count" },
            lastAt: { $max: "$lastAt" },
            firstAt: { $min: "$firstAt" },
            source: { $first: "$source" },
            message: { $first: "$message" },
            stack: { $first: "$stack" },
            path: { $first: "$path" },
            roles: { $addToSet: "$role" },
          },
        },
        { $sort: { lastAt: -1 } },
        { $limit: limit },
      ])
      .toArray(),
    col.aggregate([{ $match: { day: dayKey(now) } }, { $group: { _id: null, n: { $sum: "$count" }, kinds: { $sum: 1 } } }]).toArray(),
    col.aggregate([{ $match: { lastAt: { $gte: since } } }, { $group: { _id: null, n: { $sum: "$count" } } }]).toArray(),
  ]);

  return {
    days,
    today: { count: todayAgg[0]?.n ?? 0, kinds: todayAgg[0]?.kinds ?? 0 },
    recentCount: weekAgg[0]?.n ?? 0,
    items: groups.map((g) => ({
      fp: g._id,
      count: g.count,
      lastAt: g.lastAt?.toISOString() ?? null,
      firstAt: g.firstAt?.toISOString() ?? null,
      source: g.source,
      message: g.message,
      stack: g.stack ?? "",
      path: g.path ?? null,
      roles: (g.roles ?? []).filter(Boolean).sort(),
    })),
  };
}
