import { describe, it, expect } from "vitest";
import { isActiveClassCached, rememberActiveClass, forgetActiveClass } from "./activeClassCache.js";

describe("학급 확인 기억 (1분)", () => {
  it("기억 → 1분 뒤 만료, 휴지통으로 옮기면 바로 잊음", () => {
    const t0 = 1_000_000;
    expect(isActiveClassCached("t", "c1", t0)).toBe(false);
    rememberActiveClass("t", "c1", t0);
    expect(isActiveClassCached("t", "c1", t0 + 59_000)).toBe(true);
    expect(isActiveClassCached("t", "c1", t0 + 61_000)).toBe(false);
    rememberActiveClass("t", "c1", t0);
    forgetActiveClass("c1");
    expect(isActiveClassCached("t", "c1", t0 + 1)).toBe(false);
  });
});
