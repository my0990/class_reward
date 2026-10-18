import { describe, it, expect } from "vitest";
import { splitTime, replaceUnit, noiseLevel, rawNoise, smoothNoise, circleColor, aWeight, voiceWeights } from "./timerMath.js";

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
    // 고르게 퍼진 소리: 예전 식(1024개 합/10000×민감도)과 같은 값
    expect(rawNoise(new Uint8Array(1024).fill(100), 50)).toBeCloseTo((1024 * 100 / 10000) * 50);
    expect(smoothNoise(0, 100, 20)).toBeCloseTo(1);
    // 간격이 달라도 같은 시간 뒤에는 같은 값
    let a = 0;
    for (let i = 0; i < 50; i++) a = smoothNoise(a, 100, 20);
    let b = 0;
    for (let i = 0; i < 10; i++) b = smoothNoise(b, 100, 100);
    expect(a).toBeCloseTo(b, 5);
  });

  it("목소리 구간·A 가중치", () => {
    expect(aWeight(1000)).toBeCloseTo(1, 1);
    expect(aWeight(100)).toBeLessThan(0.15); // 낮은 웅웅거림은 크게 줄어듦
    const w = voiceWeights(1024, 48000); // 막대 하나 ≈ 23Hz
    expect(w[5]).toBe(0); // ~129Hz: 바람·에어컨 → 안 셈
    expect(w[42]).toBeGreaterThan(0.9); // ~1kHz: 목소리
    expect(w[300]).toBe(0); // ~7kHz: 안 셈

    // 같은 세기라도 낮은 소리(바람)는 0, 목소리 구간 소리는 크게
    const wind = new Uint8Array(1024);
    wind.fill(200, 0, 12);
    const voice = new Uint8Array(1024);
    voice.fill(200, 30, 100);
    expect(rawNoise(wind, 50, w)).toBe(0);
    expect(rawNoise(voice, 50, w)).toBeGreaterThan(rawNoise(voice, 50));
  });

  it("원형 타이머 색", () => {
    expect([10, 6, 3, 1].map(circleColor)).toEqual(["#04B404", "#FFFF00", "#FF8000", "#FF0000"]);
  });
});
