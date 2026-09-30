import { describe, it, expect, vi } from "vitest";
import { hash } from "bcryptjs";
import { setupTestMongo, makeScope } from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const { verifyStudentPasswordService, MAX_FAILED_ATTEMPTS, LOCK_MS } = await import("./kioskAuth.service.js");

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope();

const usersCol = () => mongo.client.db("user").collection("users");
const attemptsCol = () => mongo.client.db("user").collection("kiosk_pwd_attempts");

async function seedUser({ userId = "s1", password = "1234", s = scope, field = "passwordHash" } = {}) {
  await usersCol().insertOne({
    userId,
    role: "student",
    teacher_id: s.teacherObjectId,
    classId: s.classObjectId,
    [field]: await hash(password, 4), // 테스트 속도를 위해 cost 4
  });
}

const check = (userPwd, { userId = "s1", s = scope, now } = {}) =>
  verifyStudentPasswordService({ teacher_id: s.teacher_id, userId, userPwd, now });

describe("verifyStudentPasswordService (키오스크 학생 비밀번호 확인)", () => {
  // setupTestMongo는 "data" DB만 비우므로 "user" DB는 여기서 비운다.
  const reset = async () => {
    await usersCol().deleteMany({});
    await attemptsCol().deleteMany({});
  };

  it("비밀번호가 맞으면 통과하고 학생의 학급 id를 준다", async () => {
    await reset();
    await seedUser();
    const res = await check("1234");
    expect(res).toEqual({ ok: true, classId: scope.classId });
  });

  it("예전 필드(password)에 저장된 해시도 확인한다", async () => {
    await reset();
    await seedUser({ field: "password" });
    expect((await check("1234")).ok).toBe(true);
  });

  it("틀리면 남은 횟수를 알려준다", async () => {
    await reset();
    await seedUser();
    const res = await check("0000");
    expect(res.ok).toBe(false);
    expect(res.message).toContain(`${MAX_FAILED_ATTEMPTS - 1}번 더 틀리면`);
  });

  it(`${MAX_FAILED_ATTEMPTS}번 틀리면 5분 동안 맞는 비밀번호도 거부하고, 5분 뒤에는 풀린다`, async () => {
    await reset();
    await seedUser();
    const t0 = new Date("2026-09-30T09:00:00Z");

    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      await check("0000", { now: t0 });
    }

    const locked = await check("1234", { now: new Date(t0.getTime() + 60_000) });
    expect(locked.ok).toBe(false);
    expect(locked.locked).toBe(true);

    const unlocked = await check("1234", { now: new Date(t0.getTime() + LOCK_MS + 1) });
    expect(unlocked.ok).toBe(true);
  });

  it("성공하면 틀린 횟수가 초기화된다", async () => {
    await reset();
    await seedUser();
    await check("0000");
    await check("0000");
    await check("1234");
    const res = await check("0000");
    expect(res.message).toContain(`${MAX_FAILED_ATTEMPTS - 1}번 더 틀리면`);
  });

  it("다른 교사의 학생은 확인할 수 없다 (없는 학생과 같은 메시지)", async () => {
    await reset();
    await seedUser({ s: other });
    const res = await check("1234");
    expect(res.ok).toBe(false);
    expect(res.message).toContain("비밀번호를 확인해주세요.");
  });

  it("잠금은 학생별로 따로 걸린다", async () => {
    await reset();
    await seedUser({ userId: "s1" });
    await seedUser({ userId: "s2" });
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) await check("0000", { userId: "s1" });
    expect((await check("1234", { userId: "s2" })).ok).toBe(true);
  });

  it("입력이 비었거나 교사 id가 이상하면 거부", async () => {
    expect((await check("")).ok).toBe(false);
    expect((await verifyStudentPasswordService({ teacher_id: "bad", userId: "s1", userPwd: "1" })).ok).toBe(false);
  });
});
