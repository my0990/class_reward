import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { hash } from "bcryptjs";
import {
  parseAdminEmails,
  isAdminEmail,
  isAdminSessionUser,
  authorizeAdmin,
  AdminLockedError,
  ADMIN_LOGIN_LIMITS,
} from "@/lib/auth/adminAuth";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo } = await import("@/test/helpers/testMongo");
const mongo = setupTestMongo();

const EMAIL = "boss@test.com";
const PASSWORD = "correct-horse-1";
let db;

beforeEach(async () => {
  vi.stubEnv("ADMIN_EMAILS", ` ${EMAIL.toUpperCase()} , other@test.com`);
  db = mongo.client.db("admins");
  await Promise.all((await db.collections()).map((c) => c.deleteMany({})));
  await db.collection("accounts").insertOne({ email: EMAIL, passwordHash: await hash(PASSWORD, 4) });
});
afterEach(() => vi.unstubAllEnvs());

describe("허용 목록 ADMIN_EMAILS", () => {
  it("쉼표로 나누고 공백·대소문자를 정리한다", () => {
    expect(parseAdminEmails(" A@x.com, ,b@Y.com ")).toEqual(["a@x.com", "b@y.com"]);
    expect(parseAdminEmails(undefined)).toEqual([]);
  });

  it("목록에 있는 이메일만 관리자", () => {
    expect(isAdminEmail("Boss@Test.com")).toBe(true);
    expect(isAdminEmail("teacher@test.com")).toBe(false);
    expect(isAdminEmail("")).toBe(false);
  });

  it("세션: role=admin + 허용 목록 + 만료 전이어야 한다", () => {
    const now = 1_000_000;
    expect(isAdminSessionUser({ role: "admin", email: EMAIL, expiresAt: now + 1 }, now)).toBe(true);
    expect(isAdminSessionUser({ role: "admin", email: EMAIL, expiresAt: now - 1 }, now)).toBe(false);
    expect(isAdminSessionUser({ role: "teacher", email: EMAIL }, now)).toBe(false);
    expect(isAdminSessionUser({ role: "admin", email: "gone@test.com" }, now)).toBe(false);
    expect(isAdminSessionUser(undefined, now)).toBe(false);
  });
});

describe("authorizeAdmin", () => {
  it("맞는 비밀번호면 로그인되고 lastLoginAt, 감사 기록이 남는다", async () => {
    const user = await authorizeAdmin(db, { email: " BOSS@test.com ", password: PASSWORD });
    expect(user).toMatchObject({ email: EMAIL });
    expect(typeof user._id).toBe("string");

    const account = await db.collection("accounts").findOne({ email: EMAIL });
    expect(account.lastLoginAt).toBeInstanceOf(Date);
    expect(await db.collection("audit_log").countDocuments({ action: "login" })).toBe(1);
  });

  it("틀린 비밀번호면 null", async () => {
    expect(await authorizeAdmin(db, { email: EMAIL, password: "wrong" })).toBeNull();
  });

  it("DB에 계정이 있어도 ADMIN_EMAILS에서 빠지면 로그인 불가", async () => {
    vi.stubEnv("ADMIN_EMAILS", "other@test.com");
    expect(await authorizeAdmin(db, { email: EMAIL, password: PASSWORD })).toBeNull();
  });

  it(`${ADMIN_LOGIN_LIMITS.MAX_FAILS}번 틀리면 잠기고, 잠긴 동안은 맞는 비밀번호도 거부한다`, async () => {
    const now = new Date("2026-10-05T00:00:00Z");
    for (let i = 0; i < ADMIN_LOGIN_LIMITS.MAX_FAILS - 1; i++) {
      expect(await authorizeAdmin(db, { email: EMAIL, password: "x" }, { now })).toBeNull();
    }
    await expect(authorizeAdmin(db, { email: EMAIL, password: "x" }, { now })).rejects.toBeInstanceOf(AdminLockedError);
    await expect(authorizeAdmin(db, { email: EMAIL, password: PASSWORD }, { now })).rejects.toBeInstanceOf(AdminLockedError);
    expect(await db.collection("audit_log").countDocuments({ action: "login_locked" })).toBe(1);

    // 15분 지나면 다시 로그인 가능
    const later = new Date(now.getTime() + ADMIN_LOGIN_LIMITS.LOCK_MS + 1000);
    expect(await authorizeAdmin(db, { email: EMAIL, password: PASSWORD }, { now: later })).toMatchObject({ email: EMAIL });
  });

  it("성공하면 실패 횟수가 초기화된다", async () => {
    for (let i = 0; i < ADMIN_LOGIN_LIMITS.MAX_FAILS - 1; i++) {
      await authorizeAdmin(db, { email: EMAIL, password: "x" });
    }
    await authorizeAdmin(db, { email: EMAIL, password: PASSWORD });
    expect(await db.collection("admin_login_attempts").countDocuments()).toBe(0);
    expect(await authorizeAdmin(db, { email: EMAIL, password: "x" })).toBeNull(); // 바로 잠기지 않음
  });
});
