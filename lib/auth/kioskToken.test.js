import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = "test-secret";
});

const { createKioskToken, verifyKioskToken, KIOSK_TOKEN_TTL_MS } = await import("./kioskToken.js");

const target = { teacher_id: "t1", classId: "c1", userId: "s1" };
const now = 1_000_000;

describe("kioskToken", () => {
  it("발급한 토큰은 같은 교사/학급/학생에 대해 유효하다", () => {
    const token = createKioskToken({ ...target, now });
    expect(verifyKioskToken(token, { ...target, now: now + 1000 })).toBe(true);
  });

  it("3분이 지나면 만료된다", () => {
    const token = createKioskToken({ ...target, now });
    expect(verifyKioskToken(token, { ...target, now: now + KIOSK_TOKEN_TTL_MS + 1 })).toBe(false);
  });

  it.each([
    ["다른 학생", { userId: "s2" }],
    ["다른 학급", { classId: "c2" }],
    ["다른 교사(다른 키오스크)", { teacher_id: "t2" }],
  ])("%s에게는 쓸 수 없다", (_, change) => {
    const token = createKioskToken({ ...target, now });
    expect(verifyKioskToken(token, { ...target, ...change, now })).toBe(false);
  });

  it("내용을 바꾸면(위조) 서명이 맞지 않는다", () => {
    const token = createKioskToken({ ...target, now });
    const [, sig] = token.split(".");
    const forgedPayload = Buffer.from(JSON.stringify({ t: "t1", c: "c1", u: "s2", exp: now + 999999 })).toString("base64url");
    expect(verifyKioskToken(`${forgedPayload}.${sig}`, { ...target, userId: "s2", now })).toBe(false);
  });

  it("다른 비밀키로 만든 토큰은 거부한다", async () => {
    process.env.NEXTAUTH_SECRET = "other-secret";
    const token = createKioskToken({ ...target, now });
    process.env.NEXTAUTH_SECRET = "test-secret";
    expect(verifyKioskToken(token, { ...target, now })).toBe(false);
  });

  it.each([undefined, null, "", "abc", "a.b.c", 123])("형식이 이상한 값(%j)은 거부한다", (token) => {
    expect(verifyKioskToken(token, { ...target, now })).toBe(false);
  });
});
