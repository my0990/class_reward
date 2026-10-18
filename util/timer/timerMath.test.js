import { describe, it, expect } from "vitest";
import { splitTime, replaceUnit, noiseLevel, rawNoise, smoothNoise, circleColor } from "./timerMath.js";

describe("타이머 계산", () => {
  it("남은 시간 → 시·분·초 (초는 올림)", () => {
    expect(splitTime(0)).toEqual({ h: 0, m: 0, s: 0 });
    expect(splitTime(200)).toEqual({ h: 0, m: 0, s: 1 });
    expect(splitTime((3600 + 2 * 60 + 5) * 1000)).toEqual({ h: 1, m: 2, s: 5 });
  });

  it("시·분·초 중 하나만 바꾸기", () => {
    expect(replaceUnit(5 * 60_000, "m", 3)).toBe(3 * 60_000);
    expect(replaceUnit(5 * 60_000 + 7000, "s", 30)).toBe(5 * 60_000 + 30_000);
    expect(replaceUnit(0, "h", "1")).toBe(3600_000);
    expect(replaceUnit(0, "m", "abc")).toBe(0);
  });
});

describe("소음 측정", () => {
  it("배경색 단계", () => {
    expect([0, 41, 61, 81, 101].map(noiseLevel)).toEqual([0, 1, 2, 3, 4]);
  });

  it("측정값과 부드럽게 따라가기", () => {
    expect(rawNoise(new Uint8Array([100, 100]), 50)).toBe(1);
    expect(smoothNoise(0, 100, 20)).toBeCloseTo(1);
    // 간격이 달라도 같은 시간 뒤에는 같은 값
    let a = 0;
    for (let i = 0; i < 50; i++) a = smoothNoise(a, 100, 20);
    let b = 0;
    for (let i = 0; i < 10; i++) b = smoothNoise(b, 100, 100);
    expect(a).toBeCloseTo(b, 5);
  });

  it("원형 타이머 색", () => {
    expect([10, 6, 3, 1].map(circleColor)).toEqual(["#04B404", "#FFFF00", "#FF8000", "#FF0000"]);
  });
});
