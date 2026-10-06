import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupTestMongo } from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { assertNotLocked, recordLoginFailure, clearLoginFailures, LoginLockedError, LOGIN_LIMITS } = await import("./loginLimit.js");

const mongo = setupTestMongo();
const t0 = new Date("2026-10-07T00:00:00Z");
let db;
beforeEach(async () => {
  db = mongo.client.db("user");
  await db.collection("login_attempts").deleteMany({});
});

describe("로그인 실패 제한", () => {
  it(`${LOGIN_LIMITS.MAX_FAILS}번 틀리면 잠기고, 시간이 지나면 풀린다`, async () => {
    for (let i = 0; i < LOGIN_LIMITS.MAX_FAILS - 1; i++) await recordLoginFailure(db, "student:a", t0);
    await expect(assertNotLocked(db, "student:a", t0)).resolves.toBeUndefined();
    await expect(recordLoginFailure(db, "student:a", t0)).rejects.toBeInstanceOf(LoginLockedError);
    await expect(assertNotLocked(db, "student:a", t0)).rejects.toBeInstanceOf(LoginLockedError);
    await expect(assertNotLocked(db, "student:a", new Date(t0.getTime() + LOGIN_LIMITS.LOCK_MS + 1))).resolves.toBeUndefined();
  });

  it("계정마다 따로 세고, 성공하면 초기화", async () => {
    for (let i = 0; i < LOGIN_LIMITS.MAX_FAILS - 1; i++) await recordLoginFailure(db, "student:a", t0);
    await expect(assertNotLocked(db, "student:b", t0)).resolves.toBeUndefined();
    await clearLoginFailures(db, "student:a");
    await expect(recordLoginFailure(db, "student:a", t0)).resolves.toBeUndefined(); // 1번째부터 다시
  });
});
