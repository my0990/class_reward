import { describe, it, expect, vi } from "vitest";
import { ObjectId } from "mongodb";
import { setupTestMongo, makeScope, seedStudent, getStudent } from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const { handlePointService } = await import("./handlePointService.js");

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope();

const send = (targetStudent, point, isSend = true, s = scope) =>
  handlePointService({ teacher_id: s.teacher_id, classId: s.classId, targetStudent, point, isSend });

describe("handlePointService (포인트 지급/회수)", () => {
  it("여러 학생에게 한 번에 지급한다", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", money: 100 });
    await seedStudent(mongo.db, scope, { userId: "s2", money: 0 });

    const res = await send([{ userId: "s1" }, { userId: "s2" }], 50);

    expect(res.success).toBe(true);
    expect(res.data.modifiedCount).toBe(2);
    expect((await getStudent(mongo.db, "s1")).money).toBe(150);
    expect((await getStudent(mongo.db, "s2")).money).toBe(50);
  });

  it("회수하면 잔액이 줄어든다", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", money: 100 });

    const res = await send([{ userId: "s1" }], 30, false);

    expect(res.success).toBe(true);
    expect((await getStudent(mongo.db, "s1")).money).toBe(70);
    const history = await mongo.db.collection("history").findOne({ userId: "s1" });
    expect(history).toMatchObject({ type: "출금", name: "선생님에게 뺏김", amount: 30, balance: 70 });
  });

  it("거래 기록의 잔액은 화면에서 보낸 money가 아니라 서버의 실제 잔액이다", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", money: 100 });

    // 화면이 오래돼서 money를 0으로 알고 있는 상황
    await send([{ userId: "s1", money: 0 }], 30);

    const history = await mongo.db.collection("history").findOne({ userId: "s1" });
    expect(history.balance).toBe(130);
    expect(history).toMatchObject({ type: "입금", name: "선생님에게 받음" });
  });

  it("거래 기록의 amount는 숫자, teacher_id/classId는 ObjectId로 저장된다", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", money: 0 });

    await send([{ userId: "s1" }], "30"); // 화면 입력값은 문자열로 올 수 있다

    const history = await mongo.db.collection("history").findOne({ userId: "s1" });
    expect(history.amount).toBe(30);
    expect(history.teacher_id).toBeInstanceOf(ObjectId);
    expect(history.classId).toBeInstanceOf(ObjectId);
    expect(history.classId.toString()).toBe(scope.classId);
    expect((await getStudent(mongo.db, "s1")).money).toBe(30);
  });

  it("다른 학급 학생이 섞여 있어도 이 학급 학생만 바뀌고 기록된다", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", money: 0 });
    await seedStudent(mongo.db, other, { userId: "outsider", money: 0 });

    const res = await send([{ userId: "s1" }, { userId: "outsider" }], 10);

    expect(res.data.userIds).toEqual(["s1"]);
    expect((await getStudent(mongo.db, "outsider")).money).toBe(0);
    expect(await mongo.db.collection("history").countDocuments({ userId: "outsider" })).toBe(0);
  });

  it("다른 교사의 학급 정보로는 아무도 바뀌지 않는다", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", money: 0 });

    const res = await send([{ userId: "s1" }], 10, true, other);

    expect(res.success).toBe(false);
    expect((await getStudent(mongo.db, "s1")).money).toBe(0);
    expect(await mongo.db.collection("history").countDocuments()).toBe(0);
  });

  it("같은 학생이 두 번 들어와도 한 번만 지급된다", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", money: 0 });

    await send([{ userId: "s1" }, { userId: "s1" }], 10);

    expect((await getStudent(mongo.db, "s1")).money).toBe(10);
    expect(await mongo.db.collection("history").countDocuments()).toBe(1);
  });

  it.each([0, -5, 1.5, "abc", "", null])("포인트가 %j이면 거부하고 아무것도 바꾸지 않는다", async (point) => {
    await seedStudent(mongo.db, scope, { userId: "s1", money: 100 });

    const res = await send([{ userId: "s1" }], point);

    expect(res.success).toBe(false);
    expect((await getStudent(mongo.db, "s1")).money).toBe(100);
    expect(await mongo.db.collection("history").countDocuments()).toBe(0);
  });

  it("대상 학생이 없으면 거부한다", async () => {
    expect((await send([], 10)).success).toBe(false);
    expect((await send([{ money: 1 }], 10)).success).toBe(false);
  });

  it("잘못된 id 형식이면 거부한다", async () => {
    const res = await handlePointService({ teacher_id: "bad", classId: "bad", targetStudent: [{ userId: "s1" }], point: 10, isSend: true });
    expect(res.success).toBe(false);
  });
});
