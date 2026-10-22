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

export function buildClassHistoryFilter({ teacherObjectId, classObjectId, kind, userId, period, cursor, now = new Date() }) {
  const and = [{ teacher_id: teacherObjectId, classId: classObjectId }];
  if (kind && KIND_FILTER[kind]) and.push(KIND_FILTER[kind]);
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
      projection: { userId: 1, name: 1, type: 1, amount: 1, balance: 1, date: 1, kind: 1 },
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
