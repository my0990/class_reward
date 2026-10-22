import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo, makeScope, seedStudent, getStudent } = await import("@/test/helpers/testMongo");
const svc = await import("./request.service.js");

const mongo = setupTestMongo();
const s = makeScope();
const other = makeScope();
const teacher = { role: "teacher", teacherId: s.teacher_id, label: "선생님" };
const ctx = { teacherObjectId: s.teacher_id, classObjectId: s.classId };
let questId;

const requests = () => mongo.db.collection("requests");
const ask = (userId, q = questId) => svc.createQuestRequestService({ ...ctx, userId, questId: q });
const pendingIds = async () => (await requests().find({ status: "pending" }).toArray()).map((r) => String(r._id));
const decide = (ids, decision, actor = teacher, reason) => svc.decideRequestsService({ ...ctx, actor, requestIds: ids, decision, reason });

beforeEach(async () => {
  await seedStudent(mongo.db, s, { userId: "a", money: 0, exp: 0 });
  await seedStudent(mongo.db, s, { userId: "b", money: 0, exp: 0 });
  await seedStudent(mongo.db, other, { userId: "x" });
  questId = new ObjectId();
  await mongo.db.collection("quest").insertOne({
    _id: questId,
    teacher_id: s.teacherObjectId,
    classId: s.classObjectId,
    questName: "독서",
    questReward: 10,
    questExp: 5,
    questTitle: "",
    finished: [],
    time: new Date(),
  });
});

describe("퀘스트 완료 신청 (키오스크)", () => {
  it("신청 → 목록에 '확인 중', 같은 퀘스트는 한 번만", async () => {
    await ask("a");
    await expect(ask("a")).rejects.toThrow("이미 신청했어요");
    const list = await svc.listKioskQuestsService(ctx);
    expect(list).toEqual([expect.objectContaining({ questName: "독서", questReward: 10, finished: [], pending: ["a"] })]);
  });

  it("여러 명 한 번에 신청: 이미 신청·다른 반·이미 완료는 건너뜀", async () => {
    await ask("a");
    await seedStudent(mongo.db, s, { userId: "c" });
    await mongo.db.collection("quest").updateOne({ _id: questId }, { $set: { finished: ["c"] } });
    const r = await svc.createQuestRequestsService({ ...ctx, questId, userIds: ["a", "b", "x", "c", "b"] });
    expect(r.created).toEqual(["b"]);
    expect(r.skipped.map((x) => x.userId)).toEqual(["a", "x", "c"]);
    await expect(svc.createQuestRequestsService({ ...ctx, questId, userIds: [] })).rejects.toThrow("학생을 골라");
    await expect(svc.createQuestRequestsService({ ...ctx, questId: new ObjectId(), userIds: ["b"] })).rejects.toThrow("퀘스트를 찾을 수 없어요");
  });

  it("다른 반 학생·없는 퀘스트·이미 완료한 퀘스트는 신청 못 함", async () => {
    await expect(ask("x")).rejects.toThrow("우리 반 학생만");
    await expect(ask("a", new ObjectId())).rejects.toThrow("퀘스트를 찾을 수 없어요");
    await mongo.db.collection("quest").updateOne({ _id: questId }, { $set: { finished: ["a"] } });
    await expect(ask("a")).rejects.toThrow("이미 완료한");
  });
});

describe("승인·반려", () => {
  it("승인하면 보상 지급 + 완료 표시 + 거래 기록, 처리한 사람 남김", async () => {
    await ask("a");
    await ask("b");
    const summary = await decide(await pendingIds(), "approve");
    expect(summary).toMatchObject({ approved: 2, skipped: 0 });
    expect(await getStudent(mongo.db, "a")).toMatchObject({ money: 10, exp: 5 });
    expect((await mongo.db.collection("quest").findOne({ _id: questId })).finished.sort()).toEqual(["a", "b"]);
    expect(await mongo.db.collection("history").countDocuments({ name: "퀘스트 완료" })).toBe(2);
    const done = await svc.listRequestsService({ ...ctx, status: "done" });
    expect(done).toHaveLength(2);
    expect(done[0]).toMatchObject({ status: "approved", decidedBy: { role: "teacher", label: "선생님" } });
    expect((await svc.listKioskQuestsService(ctx))[0]).toMatchObject({ pending: [], finished: expect.arrayContaining(["a", "b"]) });
  });

  it("두 번 눌러도 한 번만 지급, 이미 완료한 학생은 보상 없이 닫음", async () => {
    await ask("a");
    await ask("b");
    const ids = await pendingIds();
    await decide([ids[0]], "approve");
    const again = await decide([ids[0]], "approve");
    expect(again).toMatchObject({ approved: 0, skipped: 1 });

    // b는 그 사이 선생님이 퀘스트 화면에서 직접 완료 처리
    await mongo.db.collection("quest").updateOne({ _id: questId }, { $addToSet: { finished: "b" } });
    const r = await decide([ids[1]], "approve");
    expect(r).toMatchObject({ approved: 0, alreadyDone: 1 });
    expect((await getStudent(mongo.db, "b")).money).toBe(0);
    expect((await getStudent(mongo.db, "a")).money).toBe(10);
  });

  it("반려하면 보상 없음, 사유 저장, 다시 신청 가능", async () => {
    await ask("a");
    const [id] = await pendingIds();
    expect(await decide([id], "reject", teacher, "사진이 없어요")).toMatchObject({ rejected: 1 });
    expect((await getStudent(mongo.db, "a")).money).toBe(0);
    expect((await requests().findOne({ _id: new ObjectId(id) })).reason).toBe("사진이 없어요");
    await ask("a"); // 다시 신청
    expect(await requests().countDocuments({ status: "pending" })).toBe(1);
  });

  it("다른 교사는 처리할 수 없다", async () => {
    await ask("a");
    const r = await decide(await pendingIds(), "approve", { role: "teacher", teacherId: other.teacher_id });
    expect(r).toMatchObject({ approved: 0, skipped: 1 });
    expect((await getStudent(mongo.db, "a")).money).toBe(0);
  });

  it("지워진 퀘스트의 요청은 승인해도 보상 없이 닫힌다", async () => {
    await ask("a");
    await mongo.db.collection("quest").deleteOne({ _id: questId });
    expect(await decide(await pendingIds(), "approve")).toMatchObject({ missingQuest: 1, approved: 0 });
  });
});

describe("권한 (canDecide)", () => {
  const req = { teacher_id: s.teacherObjectId, classId: s.classObjectId, type: "quest", userId: "a" };
  const manager = { role: "student", teacherId: s.teacher_id, classId: s.classId, userId: "b", permissions: ["quest"] };

  it("선생님은 자기 반 요청만", () => {
    expect(svc.canDecide(teacher, req)).toBe(true);
    expect(svc.canDecide({ role: "teacher", teacherId: other.teacher_id }, req)).toBe(false);
    expect(svc.canDecide(null, req)).toBe(false);
    expect(svc.canDecide({ role: "kiosk", teacherId: s.teacher_id }, req)).toBe(false);
  });

  it("학생 관리자(2단계): 허락된 종류·같은 반·자기 요청 아님·관리자 승인 가능 퀘스트일 때만", () => {
    const q = { managerApprovable: true };
    expect(svc.canDecide(manager, req, q)).toBe(true);
    expect(svc.canDecide(manager, req, { managerApprovable: false })).toBe(false);
    expect(svc.canDecide({ ...manager, userId: "a" }, req, q)).toBe(false); // 자기 요청
    expect(svc.canDecide({ ...manager, permissions: [] }, req, q)).toBe(false);
    expect(svc.canDecide({ ...manager, classId: other.classId }, req, q)).toBe(false);
  });
});
