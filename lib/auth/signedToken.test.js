import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = "test-secret";
});
const { createSignedToken, readSignedToken } = await import("./signedToken.js");

describe("서명 토큰", () => {
  it("만든 목적·시간 안에서만 읽힌다", () => {
    const now = 1_000_000;
    const t = createSignedToken("a", { d: "x" }, { ttlMs: 1000, now });
    expect(readSignedToken("a", t, { now: now + 999 })).toMatchObject({ d: "x" });
    expect(readSignedToken("a", t, { now: now + 1000 })).toBeNull(); // 만료
    expect(readSignedToken("b", t, { now })).toBeNull(); // 다른 목적
    expect(readSignedToken("a", t.replace(/.$/, (c) => (c === "A" ? "B" : "A")), { now })).toBeNull(); // 위조
    expect(readSignedToken("a", "nope", { now })).toBeNull();
  });
});
