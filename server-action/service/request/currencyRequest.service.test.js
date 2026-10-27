import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo, makeScope, seedStudent, getStudent } = await import("@/test/helpers/testMongo");
const rep = await import("./currencyRequest.service.js");
const req = await import("./request.service.js");

const mongo = setupTestMongo();
const s = makeScope();
const other = makeScope();
const teacher = { role: "teacher", teacherId: s.teacher_id, label: "선생님" };
const me = { teacher_id: s.teacher_id, classId: s.classId, userId: "rep" };
const requests = () => mongo.db.collection("requests");
const pendingIds = async () => (await requests().find({ status: "pending" }).toArray()).map((r) => String(r._id));
const decide = (ids, decision, reason) =>
  req.decideRequestsService({ teacherObjectId: s.teacher_id, classObjectId: s.classId, actor: teacher, requestIds: ids, decision, reason });

beforeEach(async () => {
  await seedStudent(mongo.db, s, { userId: "rep", money: 0, representative: true, classNumber: 1, profileNickname: "대표" });
  await seedStudent(mongo.db, s, { userId: "a", money: 10, classNumber: 2, profileNickname: "가" });
  await seedStudent(mongo.db, s, { userId: "b", money: 3, classNumber: 3, profileNickname: "나" });
  await seedStudent(mongo.db, s, { userId: "plain", money: 0, classNumber: 4 });
  await seedStudent(mongo.db, other, { userId: "x" });
});

describe("대표의 화폐 신청", () => {
  it("친구 목록에는 자기 자신이 없다 / 대표가 아니면 못 쓴다", async () => {
    const r = await rep.listRepClassmatesService(me);
    expect(r.students.map((x) => x.userId)).toEqual(["a", "b", "plain"]);
    expect((await rep.listRepClassmatesService({ ...me, userId: "plain" })).ok).toBe(false);
  });

  it("신청하면 대기 요청만 생기고 잔액은 그대로 (다른 반 학생은 빠짐)", async () => {
    const r = await rep.createCurrencyRequestService({ ...me, targetUserIds: ["a", "b", "x"], amount: "5", isSend: true });
    expect(r).toMatchObject({ ok: true, count: 2, skipped: 1 });
    const rows = await requests().find().toArray();
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((x) => String(x.targetId))).size).toBe(1); // 한 묶음
    expect(rows[0]).toMatchObject({ type: "currency", requestedBy: "rep", amount: 5, isSend: true, status: "pending" });
    expect((await getStudent(mongo.db, "a")).money).toBe(10);
  });

  it("자기 자신·대표 아님·잘못된 금액은 거절", async () => {
    expect((await rep.createCurrencyRequestService({ ...me, targetUserIds: ["rep", "a"], amount: 5, isSend: true })).ok).toBe(false);
    expect((await rep.createCurrencyRequestService({ ...me, userId: "plain", targetUserIds: ["a"], amount: 5, isSend: true })).ok).toBe(false);
    expect((await rep.createCurrencyRequestService({ ...me, targetUserIds: ["a"], amount: 0, isSend: true })).ok).toBe(false);
    expect((await rep.createCurrencyRequestService({ ...me, targetUserIds: ["a"], amount: 1.5, isSend: true })).ok).toBe(false);
    expect(await requests().countDocuments()).toBe(0);
  });
});

describe("승인 센터에서 처리", () => {
  it("승인하면 지급·회수가 반영되고 기록에 신청한 대표가 남는다 (일부만 승인 가능)", async () => {
    await rep.createCurrencyRequestService({ ...me, targetUserIds: ["a", "b"], amount: 5, isSend: false });
    const rows = await requests().find().toArray();
    const forA = rows.find((r) => r.userId === "a");

    const sum = await decide([String(forA._id)], "approve");
    expect(sum.currency).toBe(1);
    expect((await getStudent(mongo.db, "a")).money).toBe(5);
    expect((await getStudent(mongo.db, "b")).money).toBe(3); // 아직 대기
    const h = await mongo.db.collection("history").findOne({ userId: "a" });
    expect(h).toMatchObject({ name: "선생님에게 뺏김", amount: 5, requestedBy: "rep" });
    expect(await requests().findOne({ _id: forA._id })).toMatchObject({ status: "approved", paid: { money: -5, exp: 0 } });

    // 목록: 화폐 신청 정보
    const list = await req.listRequestsService({ teacherObjectId: s.teacher_id, classObjectId: s.classId });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ type: "currency", userId: "b", requestedBy: "rep", amount: 5, isSend: false, target: null });

    // 회수로 잔액이 마이너스가 돼도 처리된다 (선생님이 직접 할 때와 같음)
    await decide(await pendingIds(), "approve");
    expect((await getStudent(mongo.db, "b")).money).toBe(-2);
  });

  it("반려하면 잔액은 그대로, 사유가 대표의 신청 목록에 보인다", async () => {
    await rep.createCurrencyRequestService({ ...me, targetUserIds: ["a"], amount: 5, isSend: true });
    await decide(await pendingIds(), "reject", "이유가 없어요");
    expect((await getStudent(mongo.db, "a")).money).toBe(10);
    const mine = await rep.listMyCurrencyRequestsService(me);
    expect(mine.groups[0].items[0]).toMatchObject({ label: "2번 가", status: "rejected", reason: "이유가 없어요" });
  });

  it("승인할 때 이미 대표가 아니면 반영하지 않는다", async () => {
    await rep.createCurrencyRequestService({ ...me, targetUserIds: ["a"], amount: 5, isSend: true });
    await mongo.db.collection("user_data").updateOne({ userId: "rep" }, { $unset: { representative: "" } });
    const sum = await decide(await pendingIds(), "approve");
    expect(sum.notRep).toBe(1);
    expect((await getStudent(mongo.db, "a")).money).toBe(10);
  });
});

describe("대표 해제·취소", () => {
  it("대표를 해제하면 기다리던 신청이 취소된다", async () => {
    await rep.createCurrencyRequestService({ ...me, targetUserIds: ["a", "b"], amount: 5, isSend: true });
    const r = await rep.setRepresentativeService({ teacher_id: s.teacher_id, classId: s.classId, userId: "rep", on: false });
    expect(r).toMatchObject({ ok: true, canceled: 2 });
    expect(await requests().countDocuments({ status: "pending" })).toBe(0);
    expect((await getStudent(mongo.db, "rep")).representative).toBeUndefined();
    expect((await rep.setRepresentativeService({ teacher_id: s.teacher_id, classId: s.classId, userId: "x", on: true })).ok).toBe(false); // 다른 반
  });

  it("대표는 대기 중인 자기 신청을 취소할 수 있다", async () => {
    await rep.createCurrencyRequestService({ ...me, targetUserIds: ["a"], amount: 5, isSend: true });
    const [{ targetId }] = await requests().find().toArray();
    expect((await rep.cancelMyCurrencyRequestService({ ...me, batchId: String(targetId) })).ok).toBe(true);
    expect((await requests().findOne()).status).toBe("canceled");
    expect((await rep.cancelMyCurrencyRequestService({ ...me, batchId: String(targetId) })).ok).toBe(false);
  });

  it("신청 이유를 정리해서 남기고, 승인 센터·내 신청 목록에 보인다", async () => {
    await rep.createCurrencyRequestService({ ...me, targetUserIds: ["a"], amount: 5, isSend: true, memo: "  청소를\n  열심히 " });
    expect((await requests().findOne()).memo).toBe("청소를 열심히");
    const list = await req.listRequestsService({ teacherObjectId: s.teacher_id, classObjectId: s.classId });
    expect(list[0].memo).toBe("청소를 열심히");
    expect((await rep.listMyCurrencyRequestsService(me)).groups[0].memo).toBe("청소를 열심히");
    expect(rep.cleanMemo("   ")).toBeNull();
    expect(rep.cleanMemo("가".repeat(80))).toHaveLength(rep.MEMO_MAX);
  });
});
