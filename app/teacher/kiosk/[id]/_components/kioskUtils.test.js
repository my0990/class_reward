import { describe, it, expect } from "vitest";
import { getLevel, notEnoughMessage } from "./kioskUtils.js";

describe("키오스크 계산", () => {
  it("레벨: 시작 경험치 100, 10씩 증가 (100, 110, 120 ...)", () => {
    expect(getLevel(0)).toBe(1);
    expect(getLevel(99)).toBe(1);
    expect(getLevel(100)).toBe(2);
    expect(getLevel(209)).toBe(2);
    expect(getLevel(210)).toBe(3);
  });

  it("잔액 부족 문구: 받침에 따라 이/가", () => {
    expect(notEnoughMessage("쿠키")).toBe("쿠키가 모자랍니다.");
    expect(notEnoughMessage("호박")).toBe("호박이 모자랍니다.");
    expect(notEnoughMessage("coin")).toBe("coin가 모자랍니다.");
  });
});
