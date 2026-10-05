import { describe, it, expect, vi } from "vitest";
import { recheckUser, SESSION_RECHECK_MS } from "./sessionCheck.js";

const t0 = 1_000_000_000;
const token = (extra = {}) => ({ user: { _id: "u1", role: "student" }, ...extra });

describe("recheckUser (세션 확인 주기)", () => {
  it("방금 로그인했으면 DB를 조회하지 않는다", async () => {
    const findUserById = vi.fn();
    const t = await recheckUser(token(), { now: t0, justSignedIn: true, findUserById });
    expect(findUserById).not.toHaveBeenCalled();
    expect(t).toMatchObject({ invalidUser: false, checkedAt: t0 });
  });

  it("5분 안에는 다시 조회하지 않는다", async () => {
    const findUserById = vi.fn(async () => ({ _id: "u1" }));
    const t = token({ invalidUser: false, checkedAt: t0 });
    await recheckUser(t, { now: t0 + SESSION_RECHECK_MS - 1, findUserById });
    expect(findUserById).not.toHaveBeenCalled();
  });

  it("5분이 지나면 다시 조회하고 확인 시각을 갱신한다", async () => {
    const findUserById = vi.fn(async () => ({ _id: "u1" }));
    const t = token({ invalidUser: false, checkedAt: t0 });
    await recheckUser(t, { now: t0 + SESSION_RECHECK_MS, findUserById });
    expect(findUserById).toHaveBeenCalledWith("u1");
    expect(t).toMatchObject({ invalidUser: false, checkedAt: t0 + SESSION_RECHECK_MS });
  });

  it("삭제된 계정이면 invalidUser가 된다 (로그아웃)", async () => {
    const t = token({ invalidUser: false, checkedAt: t0 });
    await recheckUser(t, { now: t0 + SESSION_RECHECK_MS, findUserById: async () => null });
    expect(t.invalidUser).toBe(true);
  });

  it("한 번 무효가 된 토큰은 5분 안이라도 매번 다시 확인한다", async () => {
    const findUserById = vi.fn(async () => null);
    const t = token({ invalidUser: true, checkedAt: t0 });
    await recheckUser(t, { now: t0 + 1000, findUserById });
    expect(findUserById).toHaveBeenCalled();
  });

  it("DB 오류가 나도 로그아웃시키지 않고 다음에 다시 확인한다", async () => {
    const t = token({ invalidUser: false, checkedAt: t0 });
    await recheckUser(t, {
      now: t0 + SESSION_RECHECK_MS,
      findUserById: async () => {
        throw new Error("db down");
      },
    });
    expect(t.invalidUser).toBe(false);
    expect(t.checkedAt).toBe(t0); // 갱신하지 않음 → 다음 요청에서 재시도
  });

  it("예전 토큰(확인 기록 없음)은 한 번 조회한다", async () => {
    const findUserById = vi.fn(async () => ({ _id: "u1" }));
    const t = token();
    await recheckUser(t, { now: t0, findUserById });
    expect(findUserById).toHaveBeenCalledTimes(1);
    expect(t.invalidUser).toBe(false);
  });

  it("로그인 정보가 없는 토큰은 그대로 둔다", async () => {
    const findUserById = vi.fn();
    expect(await recheckUser({}, { findUserById })).toEqual({});
    expect(findUserById).not.toHaveBeenCalled();
  });
});
