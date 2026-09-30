import { describe, it, expect } from "vitest";
import { toNonNegativeInt } from "./toNonNegativeInt";

describe("toNonNegativeInt", () => {
  it("0 이상의 정수 number는 그대로 반환한다", () => {
    expect(toNonNegativeInt(0)).toBe(0);
    expect(toNonNegativeInt(1500)).toBe(1500);
  });

  it("숫자로 된 문자열을 정수로 변환한다", () => {
    expect(toNonNegativeInt("100")).toBe(100);
    expect(toNonNegativeInt("  42 ")).toBe(42);
    expect(toNonNegativeInt("1,000")).toBe(1000);
  });

  it("정수가 아니거나 음수거나 비어 있으면 null을 반환한다", () => {
    for (const v of ["", "   ", "1.5", "-3", "1e3", "abc", 1.5, -1, NaN, Infinity, null, undefined, {}, []]) {
      expect(toNonNegativeInt(v)).toBeNull();
    }
  });
});
