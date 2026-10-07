// 자리 바꾸기 저장 (class_data.seatPlan)
//
// seatPlan = {
//   layout: { rows, cols, desks },          교실 배치
//   rules: { fixed, front, apart, avoidPrevPartner },
//   current: { assignment, confirmedAt } | null,   지금 자리
//   history: [{ assignment, confirmedAt }],        지난 자리 (최근 5번, 최신이 앞)
//   updatedAt
// }
// 권한 확인(authorizeTeacherClass)은 action에서 한다.
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { LAYOUT_LIMITS, deskSeats, parseSeatId } from "@/util/seat/seatAlgorithm";

export const SEAT_HISTORY_MAX = 5;

function scopeOf(teacher_id, classId) {
  return { teacher_id: ObjectId.createFromHexString(teacher_id), classId: ObjectId.createFromHexString(classId) };
}

async function studentIdsOf(db, scope) {
  const docs = await db.collection("user_data").find({ ...scope, role: "student" }, { projection: { userId: 1 } }).toArray();
  return new Set(docs.map((d) => d.userId));
}

/** 교실 배치 검사 → 정리된 layout 또는 { error } */
export function cleanLayout(layout) {
  const rows = Number(layout?.rows);
  const cols = Number(layout?.cols);
  const ok = (n) => Number.isInteger(n) && n >= LAYOUT_LIMITS.MIN && n <= LAYOUT_LIMITS.MAX;
  if (!ok(rows) || !ok(cols)) return { error: `줄과 칸은 ${LAYOUT_LIMITS.MIN}~${LAYOUT_LIMITS.MAX} 사이로 정해 주세요.` };
  const desks = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => Boolean(layout?.desks?.[r]?.[c])));
  return { layout: { rows, cols, desks } };
}

/** 조건 검사: 이 학급 학생만, 책상이 있는 자리만 남긴다 */
export function cleanRules(rules, layout, studentIds) {
  const seats = new Set(deskSeats(layout));
  const fixed = {};
  for (const [u, s] of Object.entries(rules?.fixed ?? {})) if (studentIds.has(u) && seats.has(s)) fixed[u] = s;
  const frontRows = Math.min(layout.rows, Math.max(1, Number(rules?.front?.rows) || 1));
  const frontIds = [...new Set((rules?.front?.userIds ?? []).filter((u) => studentIds.has(u)))];
  const apart = [];
  const seen = new Set();
  for (const pair of rules?.apart ?? []) {
    const [a, b] = Array.isArray(pair) ? pair : [];
    if (!studentIds.has(a) || !studentIds.has(b) || a === b) continue;
    const key = [a, b].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    apart.push([a, b]);
  }
  return { fixed, front: { userIds: frontIds, rows: frontRows }, apart, avoidPrevPartner: Boolean(rules?.avoidPrevPartner) };
}

/** 교실 배치·조건 저장 */
export async function saveSeatSetupService({ teacher_id, classId, layout, rules, now = new Date() }) {
  const l = cleanLayout(layout);
  if (l.error) return { ok: false, message: l.error };
  const db = (await connectDB).db("data");
  const scope = scopeOf(teacher_id, classId);
  const cleanedRules = cleanRules(rules, l.layout, await studentIdsOf(db, scope));
  const r = await db.collection("class_data").updateOne(scope, {
    $set: { "seatPlan.layout": l.layout, "seatPlan.rules": cleanedRules, "seatPlan.updatedAt": now },
  });
  if (!r.matchedCount) return { ok: false, message: "학급 정보를 찾을 수 없습니다." };
  return { ok: true, layout: l.layout, rules: cleanedRules };
}

/** 자리 확정: 지금 자리를 기록으로 옮기고 새 자리를 저장 */
export async function confirmSeatsService({ teacher_id, classId, assignment, now = new Date() }) {
  const db = (await connectDB).db("data");
  const scope = scopeOf(teacher_id, classId);
  const doc = await db.collection("class_data").findOne(scope, { projection: { seatPlan: 1 } });
  if (!doc) return { ok: false, message: "학급 정보를 찾을 수 없습니다." };
  const layout = doc.seatPlan?.layout;
  if (!layout) return { ok: false, message: "교실 배치를 먼저 저장해 주세요." };

  // 책상이 있는 자리에, 이 학급 학생이, 한 번씩만
  const seats = new Set(deskSeats(layout));
  const ids = await studentIdsOf(db, scope);
  const used = new Set();
  const clean = {};
  for (const [sid, u] of Object.entries(assignment ?? {})) {
    const { r, c } = parseSeatId(sid);
    if (!seats.has(sid) || !Number.isInteger(r) || !Number.isInteger(c)) return { ok: false, message: "책상이 없는 자리가 들어 있어요. 다시 섞어 주세요." };
    if (!ids.has(u) || used.has(u)) return { ok: false, message: "학생 정보가 바뀌었어요. 다시 섞어 주세요." };
    used.add(u);
    clean[sid] = u;
  }
  if (used.size !== ids.size) return { ok: false, message: "자리가 없는 학생이 있어요. 다시 섞어 주세요." };

  const history = doc.seatPlan?.current ? [doc.seatPlan.current, ...(doc.seatPlan.history ?? [])].slice(0, SEAT_HISTORY_MAX) : doc.seatPlan?.history ?? [];
  await db.collection("class_data").updateOne(scope, {
    $set: { "seatPlan.current": { assignment: clean, confirmedAt: now }, "seatPlan.history": history, "seatPlan.updatedAt": now },
  });
  return { ok: true };
}
