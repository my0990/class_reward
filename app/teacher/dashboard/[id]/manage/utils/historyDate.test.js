import { describe, it, expect } from "vitest";
import { formatHistoryDate, formatHistoryDateParts, formatFullDate } from "./historyDate.js";

// 2026-10-07 (수) 15:00 기준 (로컬 시간)
const now = new Date(2026, 9, 7, 15, 0, 0);

describe("formatHistoryDate (거래 내역 날짜)", () => {
  it("오늘", () => expect(formatHistoryDate(new Date(2026, 9, 7, 9, 5), now)).toBe("오늘 09:05"));
  it("어제 (자정 직전 포함)", () => expect(formatHistoryDate(new Date(2026, 9, 6, 23, 59), now)).toBe("어제 23:59"));
  it("올해 다른 날은 월·일·요일", () => expect(formatHistoryDate(new Date(2026, 9, 2, 13, 20), now)).toBe("10월 2일 (금) 13:20"));
  it("다른 해는 연도까지", () => expect(formatHistoryDate(new Date(2025, 11, 3, 8, 0), now)).toBe("2025년 12월 3일 08:00"));
  it("문자열 날짜(API 응답)도 처리", () => expect(formatHistoryDate(new Date(2026, 9, 7, 10, 0).toISOString(), now)).toBe("오늘 10:00"));
  it("값이 없거나 잘못되면 -", () => {
    expect(formatHistoryDate(null, now)).toBe("-");
    expect(formatHistoryDate("abc", now)).toBe("-");
  });
  it("날짜와 시간을 나눠서도 준다", () => {
    expect(formatHistoryDateParts(new Date(2026, 9, 2, 13, 20), now)).toEqual({ day: "10월 2일 (금)", time: "13:20" });
    expect(formatHistoryDateParts(null, now)).toEqual({ day: "-", time: "" });
  });
  it("전체 시각", () => expect(formatFullDate(new Date(2026, 9, 7, 9, 5, 7))).toBe("2026-10-07 09:05:07"));
});
