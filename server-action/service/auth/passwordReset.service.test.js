import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { hash, compare } from "bcryptjs";
import { setupTestMongo } from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

beforeAll(() => {
  process.env.EMAIL_CODE_HMAC_KEY = "test-hmac";
  process.env.NEXTAUTH_SECRET = "test-secret";
});

const {
  requestPasswordResetService,
  verifyPasswordResetCodeService,
  resetPasswordService,
  RESET_SENT_MESSAGE,
} = await import("./passwordReset.service.js");
const { createResetToken } = await import("@/lib/auth/passwordResetToken");

const mongo = setupTestMongo();
const userDb = () => mongo.client.db("user");
const EMAIL = "t@test.com";
const t0 = new Date("2026-10-07T09:00:00Z");
const later = (ms) => new Date(t0.getTime() + ms);

let sendMail;
let lastCode;
beforeEach(async () => {
  await Promise.all(["users", "password_resets", "email_send_log", "email_verifications"].map((c) => userDb().collection(c).deleteMany({})));
  await userDb().collection("users").insertOne({ role: "teacher", email: EMAIL, passwordHash: await hash("old-password", 4) });
  lastCode = null;
  sendMail = vi.fn(async ({ code }) => {
    lastCode = code;
    return { ok: true };
  });
});

const request = (email = EMAIL, now = t0) => requestPasswordResetService({ email, ip: "1.1.1.1", now, sendMail });

describe("비밀번호 찾기", () => {
  it("가입된 이메일과 없는 이메일의 응답이 같고, 없는 이메일에는 메일을 보내지 않는다", async () => {
    const a = await request(EMAIL);
    const b = await request("nobody@test.com");
    expect(a).toEqual({ ok: true, message: RESET_SENT_MESSAGE });
    expect(b).toEqual({ ok: true, message: RESET_SENT_MESSAGE });
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(await userDb().collection("password_resets").countDocuments()).toBe(1);
  });

  it("1분 안에 다시 요청하면 막힌다 (회원가입 메일과 같은 제한)", async () => {
    await request();
    const res = await request(EMAIL, later(10_000));
    expect(res.ok).toBe(false);
    expect(res.retryAfterSec).toBeGreaterThan(0);
  });

  it("코드 확인 → 새 비밀번호 저장 → 새 비밀번호로만 로그인 가능, passwordChangedAt 기록", async () => {
    await request();
    const v = await verifyPasswordResetCodeService({ email: EMAIL, code: lastCode, now: later(1000) });
    expect(v.ok).toBe(true);

    const r = await resetPasswordService({ resetToken: v.resetToken, newPassword: "new-password-1", now: later(2000) });
    expect(r.ok).toBe(true);

    const user = await userDb().collection("users").findOne({ email: EMAIL });
    expect(await compare("new-password-1", user.passwordHash)).toBe(true);
    expect(user.passwordChangedAt).toEqual(later(2000));
  });

  it("통과권은 한 번만 쓸 수 있다", async () => {
    await request();
    const v = await verifyPasswordResetCodeService({ email: EMAIL, code: lastCode, now: later(1000) });
    await resetPasswordService({ resetToken: v.resetToken, newPassword: "new-password-1", now: later(2000) });
    const again = await resetPasswordService({ resetToken: v.resetToken, newPassword: "hacker-password", now: later(3000) });
    expect(again.ok).toBe(false);
  });

  it("코드를 5번 틀리면 맞는 코드도 거부된다", async () => {
    await request();
    const wrong = lastCode === "000000" ? "111111" : "000000";
    for (let i = 0; i < 5; i++) {
      expect((await verifyPasswordResetCodeService({ email: EMAIL, code: wrong, now: later(1000) })).ok).toBe(false);
    }
    expect((await verifyPasswordResetCodeService({ email: EMAIL, code: lastCode, now: later(1000) })).ok).toBe(false);
  });

  it("10분이 지난 코드는 거부된다", async () => {
    await request();
    expect((await verifyPasswordResetCodeService({ email: EMAIL, code: lastCode, now: later(11 * 60_000) })).ok).toBe(false);
  });

  it("짧은 비밀번호, 만료되거나 위조된 통과권은 거부", async () => {
    const user = await userDb().collection("users").findOne({ email: EMAIL });
    const token = createResetToken({ email: EMAIL, passwordHash: user.passwordHash, now: t0.getTime() });
    expect((await resetPasswordService({ resetToken: token, newPassword: "short", now: later(1000) })).ok).toBe(false);
    expect((await resetPasswordService({ resetToken: token, newPassword: "long-enough-1", now: later(11 * 60_000) })).ok).toBe(false);
    expect((await resetPasswordService({ resetToken: token + "x", newPassword: "long-enough-1", now: later(1000) })).ok).toBe(false);
    // 위 실패들로 비밀번호는 그대로
    expect(await compare("old-password", (await userDb().collection("users").findOne({ email: EMAIL })).passwordHash)).toBe(true);
  });

  it("회원가입 인증 코드(email_verifications)로는 비밀번호를 바꿀 수 없다", async () => {
    await userDb().collection("email_verifications").insertOne({ email: EMAIL, codeHash: "x", expiresAt: later(600_000), attemptsLeft: 5 });
    expect((await verifyPasswordResetCodeService({ email: EMAIL, code: "123456", now: later(1000) })).ok).toBe(false);
  });
});
