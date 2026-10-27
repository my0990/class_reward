// 학급 기록: 반 전체의 화폐·아이템 거래 기록 (최신순, 50건씩)
// - data.history의 { teacher_id, classId, date:-1 } 인덱스를 그대로 쓴다
// - 거래 기록은 30일 뒤 자동 삭제(TTL)라 최근 30일까지만 있다
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { dayKey } from "@/lib/stats/dailyUsage";

export const CLASS_HISTORY_PAGE = 50;
export const CLASS_HISTORY_MAX = 200;
export const CLASS_HISTORY_KINDS = ["grant", "take", "buy", "quest", "donate", "use"];
export const CLASS_HISTORY_PERIODS = ["today", "7d", "all"];

const DAY = 24 * 60 * 60 * 1000;

// 종류별 조건 (utils/historyKind의 getHistoryKind와 같은 기준)
const KIND_FILTER = {
  grant: { name: "선생님에게 받음" },
  take: { name: "선생님에게 뺏김" },
  quest: { name: "퀘스트 완료" },
  donate: { name: "기부" },
  use: { $or: [{ kind: "itemUse" }, { name: /^아이템 사용/ }] },
  buy: { kind: { $ne: "itemUse" }, name: { $not: /^아이템 사용/, $regex: / 구입$|^프로필 구입$/ } },
};

/** "날짜시각_id" 형태의 다음 페이지 표시 */
export const encodeCursor = (row) => `${new Date(row.date).toISOString()}_${row._id}`;

export function decodeCursor(cursor) {
  if (typeof cursor !== "string") return null;
  const [iso, id] = cursor.split("_");
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || !/^[0-9a-f]{24}$/i.test(id ?? "")) return null;
  return { date, _id: ObjectId.createFromHexString(id) };
}

/** 기간 시작 시각 (today: 한국 오늘 0시, 7d: 7일 전, all: 없음) */
export function periodStart(period, now = new Date()) {
  if (period === "today") return new Date(`${dayKey(now)}T00:00:00+09:00`);
  if (period === "7d") return new Date(now.getTime() - 7 * DAY);
  return null;
}

/** kinds: 고른 종류들. 비었거나 전부면 거르지 않는다 (그 밖의 예전 입출금 기록도 보이게) */
export function buildClassHistoryFilter({ teacherObjectId, classObjectId, kinds = [], userId, period, cursor, now = new Date() }) {
  const and = [{ teacher_id: teacherObjectId, classId: classObjectId }];
  const picked = [...new Set(kinds)].filter((k) => KIND_FILTER[k]);
  if (picked.length > 0 && picked.length < CLASS_HISTORY_KINDS.length) {
    and.push(picked.length === 1 ? KIND_FILTER[picked[0]] : { $or: picked.map((k) => KIND_FILTER[k]) });
  }
  if (userId) and.push({ userId: String(userId) });
  const start = periodStart(period, now);
  if (start) and.push({ date: { $gte: start } });
  const c = decodeCursor(cursor);
  if (c) and.push({ $or: [{ date: { $lt: c.date } }, { date: c.date, _id: { $lt: c._id } }] });
  return and.length === 1 ? and[0] : { $and: and };
}

export async function getClassHistoryService({ limit = CLASS_HISTORY_PAGE, ...opts }) {
  const db = (await connectDB).db("data");
  const n = Math.min(Math.max(1, limit), CLASS_HISTORY_MAX);
  const rows = await db
    .collection("history")
    .find(buildClassHistoryFilter(opts), {
      projection: { userId: 1, name: 1, type: 1, amount: 1, date: 1, kind: 1, requestedBy: 1 },
    })
    .sort({ date: -1, _id: -1 })
    .limit(n + 1)
    .toArray();
  const page = rows.slice(0, n);
  return {
    rows: page.map((r) => ({ ...r, _id: String(r._id) })),
    nextCursor: rows.length > n ? encodeCursor(page.at(-1)) : null,
  };
}

// ---- 기간 합계: 학생들에게 들어온 돈(입금 전부)·나간 돈(출금 전부)과 하루 평균 ----
const PERIOD_DAYS = { today: 1, "7d": 7, all: 30 }; // all = 보관 기간(30일)

/** 한국 날짜 기준으로 from이 속한 날부터 now가 속한 날까지 며칠인지 (같은 날이면 1) */
export function kstDaysBetween(from, now) {
  const a = Date.parse(`${dayKey(from)}T00:00:00Z`);
  const b = Date.parse(`${dayKey(now)}T00:00:00Z`);
  return Math.floor((b - a) / DAY) + 1;
}

/**
 * 하루 평균의 분모: 기간 일수. 단, 이 반의 첫 기록이 기간보다 최근이면 그날부터 센다
 * (새로 만든 반이 30일로 나눠져 평균이 너무 작게 나오지 않게)
 */
export function averageDays(period, firstDate, now = new Date()) {
  const max = PERIOD_DAYS[period] ?? 30;
  if (!firstDate) return max;
  return Math.max(1, Math.min(max, kstDaysBetween(firstDate, now)));
}

export async function getClassHistoryTotalsService({ teacherObjectId, classObjectId, userId, period = "all", now = new Date() }) {
  const col = (await connectDB).db("data").collection("history");
  const scope = { teacher_id: teacherObjectId, classId: classObjectId };
  const match = { ...scope };
  if (userId) match.userId = String(userId);
  const start = periodStart(period, now);
  if (start) match.date = { $gte: start };

  const [sums, first] = await Promise.all([
    col
      .aggregate([
        { $match: match },
        {
          // 입금(선생님 지급·퀘스트 보상 등) = 들어온 돈, 출금(회수·구입·기부 등) = 나간 돈
          $group: {
            _id: { $cond: [{ $in: ["$type", ["입금", "deposit"]] }, "in", "out"] },
            total: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray(),
    col.find(scope, { projection: { date: 1 } }).sort({ date: 1 }).limit(1).toArray(),
  ]);

  const by = Object.fromEntries(sums.map((r) => [r._id, r]));
  const days = averageDays(period, first[0]?.date, now);
  const pack = (r) => ({ total: r?.total ?? 0, count: r?.count ?? 0, perDay: Math.round((r?.total ?? 0) / days) });
  return { days, in: pack(by.in), out: pack(by.out) };
}
