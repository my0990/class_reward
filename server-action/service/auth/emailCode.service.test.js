import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { setupTestMongo } from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

beforeAll(() => {
  process.env.EMAIL_CODE_HMAC_KEY = "test-hmac";
});

const { requestEmailCodeService, verifyEmailCodeService, EMAIL_LIMITS } = await import("./emailCode.service.js");
const { hashCode } = await import("@/lib/auth/email");

const mongo = setupTestMongo();
const userDb = () => mongo.client.db("user");

const MIN = 60 * 1000;
const t0 = new Date("2026-09-30T09:00:00Z");
const at = (ms) => new Date(t0.getTime() + ms);

let sendMail;
beforeEach(async () => {
  // setupTestMongo는 "data" DB만 비운다
  await Promise.all(["users", "email_verifications", "email_send_log"].map((c) => userDb().collection(c).deleteMany({})));
  sendMail = vi.fn(async () => ({ ok: true }));
});

const request = (email, { ip = "1.1.1.1", now = t0 } = {}) => requestEmailCodeService({ email, ip, now, sendMail });

describe("requestEmailCodeService (인증 메일 발송 제한)", () => {
  it("코드를 저장하고 메일을 보낸다 (저장된 해시와 보낸 코드가 일치)", async () => {
    const res = await request(" Teacher@Test.com ");
    expect(res).toEqual({ success: true });

    expect(sendMail).toHaveBeenCalledTimes(1);
    const { to, code } = sendMail.mock.calls[0][0];
    expect(to).toBe("teacher@test.com");
    expect(code).toMatch(/^\d{6}$/);

    const doc = await userDb().collection("email_verifications").findOne({ email: "teacher@test.com" });
    expect(doc.codeHash).toBe(hashCode(code));
    expect(doc.attemptsLeft).toBe(5);
    expect(doc.expiresAt.getTime()).toBe(t0.getTime() + EMAIL_LIMITS.CODE_TTL_MS);
  });

  it("같은 이메일은 1분 안에 다시 보낼 수 없고, 남은 시간을 알려준다", async () => {
    await request("a@test.com");
    const res = await request("a@test.com", { now: at(20 * 1000) });
    expect(res).toMatchObject({ success: false, status: 429, retryAfterSec: 40 });
    expect(sendMail).toHaveBeenCalledTimes(1);

    expect((await request("a@test.com", { now: at(MIN) })).success).toBe(true);
  });

  it("같은 이메일은 24시간에 5번까지만", async () => {
    for (let i = 0; i < EMAIL_LIMITS.PER_EMAIL_PER_DAY; i++) {
      expect((await request("a@test.com", { now: at(i * 2 * MIN) })).success).toBe(true);
    }
    const res = await request("a@test.com", { now: at(60 * MIN) });
    expect(res).toMatchObject({ success: false, status: 429 });
    expect(res.message).toContain("내일");

    // 24시간이 지나면 다시 가능
    expect((await request("a@test.com", { now: at(24 * 60 * MIN + 1) })).success).toBe(true);
  });

  it("같은 IP는 1시간에 10번까지만 (이메일을 바꿔도)", async () => {
    for (let i = 0; i < EMAIL_LIMITS.PER_IP_PER_HOUR; i++) {
      expect((await request(`u${i}@test.com`, { ip: "9.9.9.9" })).success).toBe(true);
    }
    const res = await request("new@test.com", { ip: "9.9.9.9" });
    expect(res).toMatchObject({ success: false, status: 429 });

    // 다른 IP는 영향 없음
    expect((await request("new@test.com", { ip: "8.8.8.8" })).success).toBe(true);
  });

  it("서비스 전체 하루 한도를 넘으면 503 (Resend 무료 한도 보호)", async () => {
    await userDb()
      .collection("email_send_log")
      .insertMany(
        Array.from({ length: EMAIL_LIMITS.GLOBAL_PER_DAY }, (_, i) => ({ email: `x${i}@t.com`, ip: `10.0.0.${i}`, sentAt: at(-MIN) }))
      );
    const res = await request("late@test.com", { ip: "7.7.7.7" });
    expect(res).toMatchObject({ success: false, status: 503 });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("이미 가입된 교사 이메일이면 409, 메일을 보내지 않는다", async () => {
    await userDb().collection("users").insertOne({ role: "teacher", email: "t@test.com" });
    expect(await request("t@test.com")).toMatchObject({ success: false, status: 409 });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it.each(["", "abc", "a@b", "a b@c.com", null])("이메일 형식이 이상하면(%j) 400", async (email) => {
    expect(await request(email)).toMatchObject({ success: false, status: 400 });
  });

  it("메일 서버가 실패해도 시도는 기록돼서 반복 호출이 막힌다", async () => {
    sendMail.mockResolvedValueOnce({ ok: false });
    expect(await request("a@test.com")).toMatchObject({ success: false, status: 502 });
    expect(await request("a@test.com", { now: at(1000) })).toMatchObject({ status: 429 });
  });

  it("새 코드를 받으면 이전 인증 완료 표시는 지워진다", async () => {
    await userDb().collection("email_verifications").insertOne({ email: "a@test.com", verifiedAt: at(-MIN) });
    await request("a@test.com");
    const doc = await userDb().collection("email_verifications").findOne({ email: "a@test.com" });
    expect(doc.verifiedAt).toBeUndefined();
  });

  it("인증 코드는 항상 6자리 숫자", async () => {
    const { generateCode6 } = await import("@/lib/auth/email");
    for (let i = 0; i < 200; i++) expect(generateCode6()).toMatch(/^\d{6}$/);
  });
});


describe("verifyEmailCodeService (회원가입 인증 코드 확인)", () => {
  const E = "new@test.com";
  let code;
  beforeEach(async () => {
    sendMail = vi.fn(async (args) => {
      code = args.code;
      return { ok: true };
    });
    await requestEmailCodeService({ email: E, ip: "1.1.1.1", now: t0, sendMail });
  });
  const verified = async () => (await userDb().collection("email_verifications").findOne({ email: E }))?.verifiedAt;

  it("맞는 코드면 verifiedAt 기록 (대소문자·공백 정리된 이메일로도)", async () => {
    expect(await verifyEmailCodeService({ email: " NEW@test.com ", code, now: at(MIN) })).toEqual({ success: true });
    expect(await verified()).toEqual(at(MIN));
  });

  it("형식이 틀리면 400", async () => {
    expect((await verifyEmailCodeService({ email: "bad", code, now: at(MIN) })).status).toBe(400);
    expect((await verifyEmailCodeService({ email: E, code: "12ab", now: at(MIN) })).status).toBe(400);
  });

  it("요청이 없거나 만료되면 400", async () => {
    expect((await verifyEmailCodeService({ email: "none@test.com", code: "123456", now: at(MIN) })).status).toBe(400);
    expect((await verifyEmailCodeService({ email: E, code, now: at(EMAIL_LIMITS.CODE_TTL_MS + 1) })).status).toBe(400);
    expect(await verified()).toBeUndefined();
  });

  it("5번 틀리면 맞는 코드도 429", async () => {
    const wrong = code === "000000" ? "111111" : "000000";
    for (let i = 0; i < 5; i++) {
      expect((await verifyEmailCodeService({ email: E, code: wrong, now: at(MIN) })).status).toBe(400);
    }
    expect((await verifyEmailCodeService({ email: E, code, now: at(MIN) })).status).toBe(429);
    expect(await verified()).toBeUndefined();
  });
});
