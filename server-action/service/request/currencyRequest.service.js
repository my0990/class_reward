// 학생 대표의 화폐 신청 (승인 센터에서 선생님이 승인해야 반영)
//
// - 대표: user_data.representative = true (학생 관리에서 선생님이 지정, 여러 명 가능)
// - 신청 한 번 = 같은 targetId(묶음 id)를 가진 요청 여러 개 (대상 학생마다 하나)
//   data.requests: { teacher_id, classId, type: "currency", targetId(묶음), userId(대상 학생),
//                    requestedBy(대표 userId), amount, isSend, memo?(신청 이유), status, createdAt, ... }
// - 지급·회수 모두 가능, 금액 한도 없음 (실수 방지용 상한만)
// - 자기 자신은 대상이 될 수 없다
// - 대표를 해제하면 그 학생의 대기 중 신청은 자동으로 취소(반려)된다
// - 승인 처리는 request.service.js의 decideRequestsService에서 (handlePointService로 지급·회수)
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { toNonNegativeInt } from "@/util/number/toNonNegativeInt";

export const MAX_TARGETS = 60;
export const MAX_AMOUNT = 1_000_000; // 한도가 아니라 0을 여러 개 잘못 누르는 실수 방지용
export const MY_REQUEST_DAYS = 30;
export const MEMO_MAX = 50; // 신청 이유 (선택)

/** 신청 이유 정리: 줄바꿈·연속 공백은 한 칸, 앞뒤 공백 제거, 최대 MEMO_MAX자. 비면 null */
export function cleanMemo(memo) {
  if (typeof memo !== "string") return null;
  const m = memo.replace(/\s+/g, " ").trim().slice(0, MEMO_MAX);
  return m || null;
}
const DAY = 24 * 60 * 60 * 1000;

export const NOT_REP_MESSAGE = "학생 대표만 쓸 수 있어요.";
const fail = (message) => ({ ok: false, message });

function scopeOf(teacher_id, classId) {
  try {
    return {
      teacher_id: teacher_id instanceof ObjectId ? teacher_id : ObjectId.createFromHexString(String(teacher_id)),
      classId: classId instanceof ObjectId ? classId : ObjectId.createFromHexString(String(classId)),
    };
  } catch {
    return null;
  }
}

async function dataDb() {
  return (await connectDB).db("data");
}

const isRep = async (db, scope, userId) =>
  Boolean(await db.collection("user_data").findOne({ ...scope, role: "student", userId: String(userId), representative: true }, { projection: { _id: 1 } }));

const labelOf = (s) => {
  const nick = s?.profileNickname || s?.userId || "";
  return s?.classNumber != null ? `${s.classNumber}번 ${nick}` : nick;
};

/** 선생님: 대표 지정·해제 (해제하면 대기 중 신청 취소) */
export async function setRepresentativeService({ teacher_id, classId, userId, on, now = new Date() }) {
  const scope = scopeOf(teacher_id, classId);
  if (!scope || !userId) return fail("잘못된 요청입니다.");
  const db = await dataDb();
  const r = await db
    .collection("user_data")
    .updateOne({ ...scope, role: "student", userId: String(userId) }, on ? { $set: { representative: true } } : { $unset: { representative: "" } });
  if (r.matchedCount === 0) return fail("학생을 찾을 수 없습니다.");

  let canceled = 0;
  if (!on) {
    const c = await db.collection("requests").updateMany(
      { ...scope, type: "currency", requestedBy: String(userId), status: "pending" },
      { $set: { status: "rejected", reason: "대표 해제로 취소", decidedAt: now, decidedBy: { role: "system", id: "system", label: "자동" } } }
    );
    canceled = c.modifiedCount;
  }
  return { ok: true, canceled };
}

/** 대표: 신청할 친구 목록 (자기 자신 제외, 이름·번호·사진만) */
export async function listRepClassmatesService({ teacher_id, classId, userId }) {
  const scope = scopeOf(teacher_id, classId);
  if (!scope) return fail("잘못된 요청입니다.");
  const db = await dataDb();
  if (!(await isRep(db, scope, userId))) return fail(NOT_REP_MESSAGE);
  const students = await db
    .collection("user_data")
    .find({ ...scope, role: "student", userId: { $ne: String(userId) } }, { projection: { _id: 0, userId: 1, classNumber: 1, profileNickname: 1, profileUrl: 1 } })
    .sort({ classNumber: 1 })
    .toArray();
  return { ok: true, students };
}

/** 대표: 화폐 신청 (대기 중으로 저장, 잔액은 그대로) */
export async function createCurrencyRequestService({ teacher_id, classId, userId, targetUserIds, amount, isSend, memo, now = new Date() }) {
  const scope = scopeOf(teacher_id, classId);
  if (!scope) return fail("잘못된 요청입니다.");
  const me = String(userId ?? "");
  const amt = toNonNegativeInt(amount);
  if (!amt) return fail("금액은 1 이상의 정수로 입력해 주세요.");
  if (amt > MAX_AMOUNT) return fail("금액이 너무 커요. 다시 확인해 주세요.");

  const ids = [...new Set((Array.isArray(targetUserIds) ? targetUserIds : []).map(String).filter(Boolean))];
  if (ids.includes(me)) return fail("자기 자신에게는 신청할 수 없어요.");
  if (ids.length === 0) return fail("친구를 골라 주세요.");
  if (ids.length > MAX_TARGETS) return fail(`한 번에 ${MAX_TARGETS}명까지 신청할 수 있어요.`);

  const db = await dataDb();
  if (!(await isRep(db, scope, me))) return fail(NOT_REP_MESSAGE);

  const found = await db
    .collection("user_data")
    .find({ ...scope, role: "student", userId: { $in: ids } }, { projection: { userId: 1 } })
    .toArray();
  const targets = ids.filter((id) => found.some((s) => s.userId === id));
  if (targets.length === 0) return fail("우리 반 친구만 고를 수 있어요.");

  const batch = new ObjectId();
  const reason = cleanMemo(memo);
  await db.collection("requests").insertMany(
    targets.map((t) => ({
      ...scope,
      type: "currency",
      targetId: batch,
      userId: t,
      requestedBy: me,
      amount: amt,
      isSend: Boolean(isSend),
      ...(reason ? { memo: reason } : {}),
      status: "pending",
      createdAt: now,
    }))
  );
  return { ok: true, count: targets.length, skipped: ids.length - targets.length };
}

/** 대표: 내 신청 목록 (최근 30일, 신청 한 번씩 묶어서) */
export async function listMyCurrencyRequestsService({ teacher_id, classId, userId, now = new Date() }) {
  const scope = scopeOf(teacher_id, classId);
  if (!scope) return fail("잘못된 요청입니다.");
  const db = await dataDb();
  if (!(await isRep(db, scope, userId))) return fail(NOT_REP_MESSAGE);

  const rows = await db
    .collection("requests")
    .find({ ...scope, type: "currency", requestedBy: String(userId), createdAt: { $gte: new Date(now.getTime() - MY_REQUEST_DAYS * DAY) } })
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();
  const students = await db
    .collection("user_data")
    .find({ ...scope, role: "student", userId: { $in: [...new Set(rows.map((r) => r.userId))] } }, { projection: { userId: 1, classNumber: 1, profileNickname: 1 } })
    .toArray();
  const byId = new Map(students.map((s) => [s.userId, s]));

  const groups = new Map();
  for (const r of rows) {
    const k = String(r.targetId);
    if (!groups.has(k)) {
      groups.set(k, { batchId: k, createdAt: r.createdAt?.toISOString?.() ?? null, amount: r.amount, isSend: Boolean(r.isSend), memo: r.memo ?? "", items: [] });
    }
    groups.get(k).items.push({
      userId: r.userId,
      label: byId.has(r.userId) ? labelOf(byId.get(r.userId)) : `${r.userId} (없는 학생)`,
      classNumber: byId.get(r.userId)?.classNumber ?? null,
      status: r.status,
      reason: r.reason ?? "",
    });
  }
  for (const g of groups.values()) g.items.sort((a, b) => (Number(a.classNumber) || Infinity) - (Number(b.classNumber) || Infinity));
  return { ok: true, groups: [...groups.values()].slice(0, 50) };
}

/** 대표: 아직 처리 안 된 내 신청 취소 */
export async function cancelMyCurrencyRequestService({ teacher_id, classId, userId, batchId, now = new Date() }) {
  const scope = scopeOf(teacher_id, classId);
  if (!scope) return fail("잘못된 요청입니다.");
  let batch;
  try {
    batch = ObjectId.createFromHexString(String(batchId));
  } catch {
    return fail("잘못된 요청입니다.");
  }
  const db = await dataDb();
  const r = await db.collection("requests").updateMany(
    { ...scope, type: "currency", targetId: batch, requestedBy: String(userId), status: "pending" },
    { $set: { status: "canceled", decidedAt: now, decidedBy: { role: "student", id: String(userId), label: "대표" } } }
  );
  return r.modifiedCount ? { ok: true, count: r.modifiedCount } : fail("취소할 신청이 없어요. 이미 처리됐을 수 있어요.");
}
