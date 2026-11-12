// 자리 바꾸기 저장 (class_data.seatPlan)
//
// seatPlan = {
//   layout: { rows, cols, desks },          교실 배치
//   rules: { fixed, groups, apart, avoidPrevPartner, excluded },   excluded: 자리 바꾸기에서 뺀 학생 userId   (예전 front는 저장할 때 '앞자리' 그룹으로 바뀜)
//   current: { assignment, layout, confirmedAt } | null,   지금 자리 (layout: 저장할 때의 책상 배치, 예전 기록엔 없음)
//   history: [{ assignment, layout, confirmedAt }],        지난 자리 (최근 5번, 최신이 앞)
//   updatedAt
// }
// 권한 확인(authorizeTeacherClass)은 action에서 한다.
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { deskSeats, parseSeatId } from "@/util/seat/seatAlgorithm";
import { cleanLayout, cleanRules, SEAT_HISTORY_MAX } from "@/util/seat/seatPlan";

export { GROUP_MAX, SEAT_HISTORY_MAX, cleanLayout, cleanRules } from "@/util/seat/seatPlan";

function scopeOf(teacher_id, classId) {
  return { teacher_id: ObjectId.createFromHexString(teacher_id), classId: ObjectId.createFromHexString(classId) };
}

async function studentIdsOf(db, scope) {
  const docs = await db.collection("user_data").find({ ...scope, role: "student" }, { projection: { userId: 1 } }).toArray();
  return new Set(docs.map((d) => d.userId));
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
/**
 * 자리 저장. replace=true면 지금 자리만 바꾸고 기록(history)에는 넣지 않는다
 * (같은 시간에 '시작'을 여러 번 눌러 다시 섞을 때 기록이 버린 결과로 채워지지 않게)
 */
export async function confirmSeatsService({ teacher_id, classId, assignment, replace = false, now = new Date() }) {
  const db = (await connectDB).db("data");
  const scope = scopeOf(teacher_id, classId);
  const doc = await db.collection("class_data").findOne(scope, { projection: { seatPlan: 1 } });
  if (!doc) return { ok: false, message: "학급 정보를 찾을 수 없습니다." };
  const layout = doc.seatPlan?.layout;
  if (!layout) return { ok: false, message: "교실 배치를 먼저 저장해 주세요." };

  // 책상이 있는 자리에, 이 학급 학생이(뺀 학생 제외), 한 번씩만
  const seats = new Set(deskSeats(layout));
  const excluded = new Set(doc.seatPlan?.rules?.excluded ?? []);
  const ids = new Set([...(await studentIdsOf(db, scope))].filter((u) => !excluded.has(u)));
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

  const prevHistory = doc.seatPlan?.history ?? [];
  const history =
    doc.seatPlan?.current && !replace ? [doc.seatPlan.current, ...prevHistory].slice(0, SEAT_HISTORY_MAX) : prevHistory;
  await db.collection("class_data").updateOne(scope, {
    $set: { "seatPlan.current": { assignment: clean, layout, confirmedAt: now }, "seatPlan.history": history, "seatPlan.updatedAt": now },
  });
  return { ok: true };
}

/**
 * 저장한 자리 기록 하나 지우기 (at = confirmedAt ISO 문자열)
 * 지금 자리를 지우면 가장 최근 지난 자리가 지금 자리가 된다 ('지난 옆자리 피하기' 기준도 그걸로)
 */
export async function deleteSeatRecordService({ teacher_id, classId, at, now = new Date() }) {
  const time = new Date(at);
  if (!at || Number.isNaN(time.getTime())) return { ok: false, message: "잘못된 요청입니다." };
  const db = (await connectDB).db("data");
  const scope = scopeOf(teacher_id, classId);
  const doc = await db.collection("class_data").findOne(scope, { projection: { seatPlan: 1 } });
  if (!doc) return { ok: false, message: "학급 정보를 찾을 수 없습니다." };

  const same = (r) => r?.confirmedAt && new Date(r.confirmedAt).getTime() === time.getTime();
  const current = doc.seatPlan?.current ?? null;
  const history = doc.seatPlan?.history ?? [];
  let next;
  if (same(current)) next = { current: history[0] ?? null, history: history.slice(1) };
  else if (history.some(same)) next = { current, history: history.filter((r) => !same(r)) };
  else return { ok: false, message: "이미 지워진 기록이에요." };

  await db.collection("class_data").updateOne(scope, {
    $set: { "seatPlan.current": next.current, "seatPlan.history": next.history, "seatPlan.updatedAt": now },
  });
  return { ok: true };
}
