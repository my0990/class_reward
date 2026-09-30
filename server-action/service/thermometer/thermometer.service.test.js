import { describe, it, expect, vi } from "vitest";
import { setupTestMongo, makeScope, seedStudent, getStudent } from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const { donateCookieService } = await import("./thermometer.service.js");

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope();

async function seedThermometer(fields = {}) {
  await mongo.db.collection("thermometer").insertOne({
    teacher_id: scope.teacherObjectId,
    classId: scope.classObjectId,
    requireCurrency: 10, // 10쿠키당 1도
    manualDegree: 0,
    ...fields,
  });
}

const getThermometer = () =>
  mongo.db.collection("thermometer").findOne({ teacher_id: scope.teacherObjectId, classId: scope.classObjectId });

const donate = (userId, amount, s = scope) =>
  donateCookieService({ userId, amount, teacher_id: s.teacher_id, classId: s.classId });

describe("donateCookieService (학급 온도계 기부)", () => {
  it("학생 쿠키를 차감하고 온도를 올리고 기부 기록을 남긴다", async () => {
    await seedThermometer();
    await seedStudent(mongo.db, scope, { userId: "s1", money: 100 });

    const res = await donate("s1", 30);

    expect(res.result).toBe(true);
    expect((await getStudent(mongo.db, "s1")).money).toBe(70);
    const t = await getThermometer();
    expect(t.manualDegree).toBe(3); // 30 / 10
    expect(t.donators.s1).toBe(30);
    const history = await mongo.db.collection("history").findOne({ userId: "s1" });
    expect(history).toMatchObject({ name: "기부", type: "출금", amount: 30, balance: 70 });
  });

  it("여러 번 기부하면 누적된다", async () => {
    await seedThermometer();
    await seedStudent(mongo.db, scope, { userId: "s1", money: 100 });

    await donate("s1", 10);
    await donate("s1", 20);

    const t = await getThermometer();
    expect(t.donators.s1).toBe(30);
    expect(t.manualDegree).toBe(3);
  });

  it("문자열 수량(\"5\")도 받는다", async () => {
    await seedThermometer();
    await seedStudent(mongo.db, scope, { userId: "s1", money: 100 });

    await donate("s1", "5");
    expect((await getStudent(mongo.db, "s1")).money).toBe(95);
  });

  it("가진 쿠키보다 많이 기부할 수 없다", async () => {
    await seedThermometer();
    await seedStudent(mongo.db, scope, { userId: "s1", money: 10 });

    await expect(donate("s1", 11)).rejects.toThrow("보유한 쿠키가 부족합니다.");
    expect((await getStudent(mongo.db, "s1")).money).toBe(10);
    expect((await getThermometer()).manualDegree).toBe(0);
  });

  it.each([0, -1, 1.5, "abc", ""])("수량이 %j이면 거부한다", async (amount) => {
    await seedThermometer();
    await seedStudent(mongo.db, scope, { userId: "s1", money: 100 });

    await expect(donate("s1", amount)).rejects.toThrow("기부 수량이 올바르지 않습니다.");
    expect((await getStudent(mongo.db, "s1")).money).toBe(100);
  });

  it("온도계가 설정되지 않은 학급이면 에러", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", money: 100 });
    await expect(donate("s1", 10)).rejects.toThrow("학급 온도계 정보를 찾을 수 없습니다.");
    expect((await getStudent(mongo.db, "s1")).money).toBe(100);
  });

  it("다른 학급 학생은 기부할 수 없다", async () => {
    await seedThermometer();
    await seedStudent(mongo.db, other, { userId: "outsider", money: 100 });

    await expect(donate("outsider", 10)).rejects.toThrow("학생 정보를 찾을 수 없습니다.");
    expect((await getStudent(mongo.db, "outsider")).money).toBe(100);
  });

  it("쿠키가 딱 한 번 기부할 만큼일 때 동시에 두 번 눌러도 한 번만 처리된다", async () => {
    await seedThermometer();
    await seedStudent(mongo.db, scope, { userId: "s1", money: 10 });

    const results = await Promise.allSettled([donate("s1", 10), donate("s1", 10)]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect((await getStudent(mongo.db, "s1")).money).toBe(0);
    expect((await getThermometer()).manualDegree).toBe(1);
  });

  it("잘못된 id 형식이면 에러", async () => {
    await expect(
      donateCookieService({ userId: "s1", amount: 1, teacher_id: "bad", classId: "bad" })
    ).rejects.toThrow("잘못된 학급 정보입니다.");
  });
});
