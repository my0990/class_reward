import { describe, it, expect } from "vitest";
import { hasUnreadNotice, NEW_DAYS } from "./noticeBadge.js";

const DAY = 86400000;
const now = Date.parse("2026-10-06T00:00:00Z");
const iso = (ms) => new Date(ms).toISOString();

describe("hasUnreadNotice (헤더 새 공지 표시)", () => {
  it("공지가 없으면 표시 안 함", () => {
    expect(hasUnreadNotice(null, null, now)).toBe(false);
  });

  it("본 시각보다 새 공지가 있으면 표시", () => {
    expect(hasUnreadNotice(iso(now - DAY), iso(now - 2 * DAY), now)).toBe(true);
    expect(hasUnreadNotice(iso(now - 2 * DAY), iso(now - 2 * DAY), now)).toBe(false);
    expect(hasUnreadNotice(iso(now - 3 * DAY), iso(now - DAY), now)).toBe(false);
  });

  it(`공지 화면을 한 번도 안 열었으면 최근 ${NEW_DAYS}일 공지만 표시`, () => {
    expect(hasUnreadNotice(iso(now - DAY), null, now)).toBe(true);
    expect(hasUnreadNotice(iso(now - (NEW_DAYS + 1) * DAY), null, now)).toBe(false);
  });
});
