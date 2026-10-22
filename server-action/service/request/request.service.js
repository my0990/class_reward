// 승인 요청 (승인 센터)
// data.requests: { teacher_id, classId, type: "quest", targetId(퀘스트 _id), userId(신청 학생),
//                  status: "pending" | "approved" | "rejected", createdAt,
//                  decidedAt?, decidedBy?: { role, id, label }, reason?, note? }
// - 키오스크에서 학생이 "다 했어요!"를 누르면 pending 요청이 생긴다 (보상은 아직 없음)
// - 선생님(나중엔 학생 관리자)이 승인하면 퀘스트 완료 처리(finishQuestService)로 보상을 준다
// - 누가 처리했는지(decidedBy)를 남긴다
// - 일일·주간 퀘스트: 요청에 그 회차(cycleKey)를 같이 저장한다. 지난 회차 신청을 늦게 승인하면
//   보상은 주되 이번 회차 완료 명단에는 넣지 않는다 (오늘 것을 또 할 수 있게)
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { finishQuestService, refreshQuestCycles } from "@/server-action/service/quest/quest.service";
import { normalizeRepeat } from "@/util/quest/questRepeat";

export const REQUEST_TYPES = ["quest"];
export const DONE_DAYS = 30; // '처리 완료' 탭에서 보여줄 기간
const DAY = 24 * 60 * 60 * 1000;

const oid = (v, name = "id") => {
  try {
    return v instanceof ObjectId ? v : ObjectId.createFromHexString(String(v));
  } catch {
    throw new Error(`잘못된 ${name}입니다.`);
  }
};

/**
 * 이 사람(actor)이 이 요청을 처리할 수 있나? — 권한은 여기서만 판단한다.
 * actor: { role: "teacher", teacherId } | { role: "student", userId, teacherId, classId, permissions: ["quest"] }
 * quest: 요청 대상 퀘스트 (학생 관리자일 때 managerApprovable 확인)
 */
export function canDecide(actor, request, quest = null) {
  if (!actor || !request) return false;
  const sameTeacher = String(actor.teacherId) === String(request.teacher_id);
  if (actor.role === "teacher") return sameTeacher;
  if (actor.role === "student") {
    // 학생 관리자 (2단계): 같은 반 + 허락된 종류 + 자기 요청 아님 + 관리자 승인 가능한 퀘스트
    return (
      sameTeacher &&
      String(actor.classId) === String(request.classId) &&
      Array.isArray(actor.permissions) &&
      actor.permissions.includes(request.type) &&
      String(actor.userId) !== String(request.userId) &&
      (request.type !== "quest" || Boolean(quest?.managerApprovable))
    );
  }
  return false;
}

/** 키오스크: 학생의 퀘스트 완료 신청 */
export async function createQuestRequestService({ teacherObjectId, classObjectId, userId, questId, now = new Date() }) {
  const db = (await connectDB).db("data");
  const scope = { teacher_id: oid(teacherObjectId, "교사"), classId: oid(classObjectId, "학급") };
  const questObjectId = oid(questId, "퀘스트");
  userId = String(userId ?? "");
  if (!userId) throw new Error("학생을 선택해 주세요.");

  await refreshQuestCycles(db, scope, now);
  const [quest, student] = await Promise.all([
    db.collection("quest").findOne({ ...scope, _id: questObjectId }, { projection: { finished: 1, cycleKey: 1 } }),
    db.collection("user_data").findOne({ ...scope, role: "student", userId }, { projection: { _id: 1 } }),
  ]);
  if (!quest) throw new Error("퀘스트를 찾을 수 없어요.");
  if (!student) throw new Error("우리 반 학생만 신청할 수 있어요.");
  if ((quest.finished ?? []).includes(userId)) throw new Error("이미 완료한 퀘스트예요.");

  try {
    // 같은 학생·같은 퀘스트의 '대기' 요청은 하나만 (upsert + DB의 부분 고유 인덱스)
    const r = await db
      .collection("requests")
      .updateOne(
        { ...scope, type: "quest", targetId: questObjectId, userId, cycleKey: quest.cycleKey ?? null, status: "pending" },
        { $setOnInsert: { createdAt: now } }, // 나머지 칸은 위 조건에서 그대로 들어간다
        { upsert: true }
      );
    if (r.upsertedCount === 0) throw new Error("이미 신청했어요. 선생님 확인을 기다려 주세요.");
  } catch (e) {
    if (e?.code === 11000) throw new Error("이미 신청했어요. 선생님 확인을 기다려 주세요.");
    throw e;
  }
  return { ok: true };
}

/**
 * 키오스크: 여러 학생이 한 번에 완료 신청 (선생님 퀘스트 화면처럼 학생을 골라서)
 * 학생마다 따로 확인해서, 이미 완료·이미 신청·다른 반은 건너뛴다.
 */
export async function createQuestRequestsService({ userIds, ...rest }) {
  const ids = [...new Set((userIds ?? []).map(String).filter(Boolean))].slice(0, 100);
  if (ids.length === 0) throw new Error("학생을 골라 주세요.");
  const result = { created: [], skipped: [] };
  for (const userId of ids) {
    try {
      await createQuestRequestService({ ...rest, userId });
      result.created.push(userId);
    } catch (e) {
      if (/퀘스트를 찾을 수 없어요/.test(e?.message)) throw e;
      result.skipped.push({ userId, reason: e?.message ?? "" });
    }
  }
  return result;
}

/** 키오스크: 퀘스트 목록 + 퀘스트마다 완료한 학생·확인 기다리는 학생 */
export async function listKioskQuestsService({ teacherObjectId, classObjectId }) {
  const db = (await connectDB).db("data");
  const scope = { teacher_id: oid(teacherObjectId, "교사"), classId: oid(classObjectId, "학급") };
  await refreshQuestCycles(db, scope);
  const [quests, pending] = await Promise.all([
    db
      .collection("quest")
      .find(scope, { projection: { questName: 1, questGoal: 1, questReward: 1, questExp: 1, questTitle: 1, finished: 1, repeat: 1, cycleKey: 1 } })
      .sort({ order: 1, time: -1 }) // 퀘스트 관리 화면과 같은 순서 (새 퀘스트가 위)
      .toArray(),
    db.collection("requests").find({ ...scope, type: "quest", status: "pending" }, { projection: { targetId: 1, userId: 1, cycleKey: 1 } }).toArray(),
  ]);
  const cycleOf = new Map(quests.map((q) => [String(q._id), q.cycleKey ?? null]));
  const pendingByQuest = new Map();
  for (const p of pending) {
    const k = String(p.targetId);
    if ((p.cycleKey ?? null) !== cycleOf.get(k)) continue; // 지난 회차 신청은 이번 회차 '확인 중'으로 치지 않음
    if (!pendingByQuest.has(k)) pendingByQuest.set(k, []);
    pendingByQuest.get(k).push(p.userId);
  }
  return quests.map((q) => ({
    _id: String(q._id),
    questName: q.questName,
    questGoal: q.questGoal ?? "",
    questReward: Number(q.questReward) || 0,
    questExp: Number(q.questExp) || 0,
    questTitle: q.questTitle ?? "",
    repeat: normalizeRepeat(q.repeat),
    finished: q.finished ?? [],
    pending: pendingByQuest.get(String(q._id)) ?? [],
  }));
}

/** 승인 센터 목록: status "pending" | "done"(최근 30일 승인·반려) */
export async function listRequestsService({ teacherObjectId, classObjectId, status = "pending", now = new Date() }) {
  const db = (await connectDB).db("data");
  const scope = { teacher_id: oid(teacherObjectId, "교사"), classId: oid(classObjectId, "학급") };
  const filter =
    status === "pending"
      ? { ...scope, status: "pending" }
      : { ...scope, status: { $in: ["approved", "rejected"] }, decidedAt: { $gte: new Date(now.getTime() - DONE_DAYS * DAY) } };
  await refreshQuestCycles(db, scope, now);
  const rows = await db
    .collection("requests")
    .find(filter)
    .sort(status === "pending" ? { createdAt: 1 } : { decidedAt: -1 })
    .limit(500)
    .toArray();

  const questIds = [...new Set(rows.filter((r) => r.type === "quest").map((r) => String(r.targetId)))].map((id) => oid(id));
  const quests = questIds.length
    ? await db
        .collection("quest")
        .find(
          { ...scope, _id: { $in: questIds } },
          { projection: { questName: 1, questReward: 1, questExp: 1, questTitle: 1, finished: 1, repeat: 1, cycleKey: 1 } }
        )
        .toArray()
    : [];
  const questById = new Map(quests.map((q) => [String(q._id), q]));

  return rows.map((r) => {
    const q = questById.get(String(r.targetId));
    const stale = Boolean(q) && normalizeRepeat(q.repeat) !== "none" && (r.cycleKey ?? null) !== (q.cycleKey ?? null);
    return {
      _id: String(r._id),
      type: r.type,
      targetId: String(r.targetId),
      userId: r.userId,
      status: r.status,
      createdAt: r.createdAt?.toISOString?.() ?? null,
      decidedAt: r.decidedAt?.toISOString?.() ?? null,
      decidedBy: r.decidedBy ?? null,
      reason: r.reason ?? "",
      note: r.note ?? "",
      target: q
        ? {
            name: q.questName,
            reward: Number(q.questReward) || 0,
            exp: Number(q.questExp) || 0,
            title: q.questTitle ?? "",
            repeat: normalizeRepeat(q.repeat),
            stale, // 지난 회차(어제·지난주) 신청
            alreadyDone: !stale && (q.finished ?? []).includes(r.userId),
          }
        : null, // 퀘스트가 지워졌으면 null
    };
  });
}

/**
 * 승인·반려 (여러 개 한 번에)
 * - 권한은 canDecide로 하나씩 확인
 * - 승인: 퀘스트별로 묶어 finishQuestService 한 번에 보상 지급.
 *   이미 완료된 학생(선생님이 직접 완료 처리 등)은 보상 없이 '승인(이미 완료)'으로만 닫는다 → 두 번 지급 방지
 * - 다른 사람이 먼저 처리한 요청은 건너뛴다 (status가 pending일 때만 바꿈)
 */
export async function decideRequestsService({ actor, teacherObjectId, classObjectId, requestIds, decision, reason = "", now = new Date() }) {
  if (!["approve", "reject"].includes(decision)) throw new Error("잘못된 요청입니다.");
  const ids = [...new Set((requestIds ?? []).map(String))].slice(0, 200).map((id) => oid(id, "요청"));
  if (ids.length === 0) throw new Error("처리할 요청을 골라 주세요.");

  const db = (await connectDB).db("data");
  const scope = { teacher_id: oid(teacherObjectId, "교사"), classId: oid(classObjectId, "학급") };
  const col = db.collection("requests");
  await refreshQuestCycles(db, scope, now);
  const requests = await col.find({ ...scope, _id: { $in: ids }, status: "pending" }).toArray();

  const questIds = [...new Set(requests.map((r) => String(r.targetId)))].map((id) => oid(id));
  const quests = await db.collection("quest").find({ ...scope, _id: { $in: questIds } }).toArray();
  const questById = new Map(quests.map((q) => [String(q._id), q]));

  const allowed = requests.filter((r) => canDecide(actor, r, questById.get(String(r.targetId))));
  const decidedBy = { role: actor.role, id: String(actor.userId ?? actor.teacherId), label: actor.label ?? (actor.role === "teacher" ? "선생님" : String(actor.userId)) };
  const summary = { approved: 0, rejected: 0, alreadyDone: 0, skipped: ids.length - allowed.length, missingQuest: 0, lateCycle: 0 };

  // 먼저 '내가 처리 중'으로 잡는다: 동시에 두 사람이 눌러도 한 번만 처리되게
  const claim = async (r, set) => (await col.updateOne({ _id: r._id, status: "pending" }, { $set: { ...set, decidedAt: now, decidedBy } })).modifiedCount === 1;

  if (decision === "reject") {
    for (const r of allowed) {
      if (await claim(r, { status: "rejected", reason: String(reason).slice(0, 100) })) summary.rejected++;
      else summary.skipped++;
    }
    return summary;
  }

  // 승인: 퀘스트별로
  const byQuest = new Map();
  for (const r of allowed) {
    const key = String(r.targetId);
    if (!byQuest.has(key)) byQuest.set(key, []);
    byQuest.get(key).push(r);
  }
  for (const [questId, list] of byQuest) {
    const quest = questById.get(questId);
    if (!quest) {
      // 지워진 퀘스트: 보상 없이 반려로 닫는다
      for (const r of list) if (await claim(r, { status: "rejected", reason: "퀘스트가 삭제됨" })) summary.missingQuest++;
      continue;
    }
    const repeating = normalizeRepeat(quest.repeat) !== "none";
    const finished = new Set(quest.finished ?? []);
    const toPay = []; // 이번 회차: 보상 + 완료 명단
    const latePay = []; // 지난 회차: 보상만
    for (const r of list) {
      const stale = repeating && (r.cycleKey ?? null) !== (quest.cycleKey ?? null);
      if (stale) {
        if (await claim(r, { status: "approved", note: "지난 회차" })) latePay.push(r);
        else summary.skipped++;
      } else if (finished.has(r.userId)) {
        if (await claim(r, { status: "approved", note: "이미 완료" })) summary.alreadyDone++;
      } else if (await claim(r, { status: "approved" })) {
        toPay.push(r);
      } else summary.skipped++;
    }
    for (const [batch, addToFinished] of [
      [toPay, true],
      [latePay, false],
    ]) {
      if (batch.length === 0) continue;
      try {
        await finishQuestService({
          teacher_id: String(scope.teacher_id),
          classId: String(scope.classId),
          questData: { _id: questId, questReward: quest.questReward, questExp: quest.questExp, questTitle: quest.questTitle },
          rewarded: batch.map((r) => ({ userId: r.userId })),
          addToFinished,
        });
        if (addToFinished) summary.approved += batch.length;
        else summary.lateCycle += batch.length;
      } catch (e) {
        // 보상 지급이 실패하면 다시 '대기'로 되돌린다
        await col.updateMany({ _id: { $in: batch.map((r) => r._id) } }, { $set: { status: "pending" }, $unset: { decidedAt: "", decidedBy: "", note: "" } });
        throw e;
      }
    }
  }
  return summary;
}

/** 대기 중 요청 수 (메뉴 숫자 표시용) */
export async function countPendingRequestsService({ teacherObjectId, classObjectId }) {
  const db = (await connectDB).db("data");
  return db.collection("requests").countDocuments({ teacher_id: oid(teacherObjectId), classId: oid(classObjectId), status: "pending" });
}
