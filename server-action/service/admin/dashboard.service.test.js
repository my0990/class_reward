import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo } = await import("@/test/helpers/testMongo");
const { getDashboardStatsService, lastDayKeys, lastWeekKeys, lastMonthKeys } = await import("@/server-action/service/admin/dashboard.service");

const mongo = setupTestMongo();
const NOW = new Date("2026-10-05T03:00:00Z"); // 한국 10/5 12시
const DAY = 24 * 60 * 60 * 1000;
const ago = (days) => new Date(NOW.getTime() - days * DAY);

beforeEach(async () => {
  for (const name of ["user", "admins"]) {
    const db = mongo.client.db(name);
    await Promise.all((await db.collections()).map((c) => c.deleteMany({})));
  }
});

describe("대시보드 통계", () => {
  it("최근 30일 날짜 키 (한국 시간)", () => {
    const keys = lastDayKeys(new Date("2026-10-04T16:00:00Z")); // 한국 10/5 01시
    expect(keys).toHaveLength(30);
    expect(keys.at(-1)).toBe("2026-10-05");
    expect(keys[0]).toBe("2026-09-06");
  });

  it("개수와 일별 집계", async () => {
    const users = mongo.client.db("user").collection("users");
    await users.insertMany([
      { role: "teacher", email: "a", createdAt: ago(0), lastSeenAt: ago(1) },
      { role: "teacher", email: "b", createdAt: ago(0), lastSeenAt: ago(10) },
      { role: "teacher", email: "c", createdAt: ago(40) },
      { role: "student", userId: "s1", lastSeenAt: ago(2) },
      { role: "student", userId: "s2", disabled: true },
    ]);
    await mongo.db.collection("classes").insertMany([{}, {}, { deletedAt: ago(1) }]);
    await mongo.db.collection("history").insertMany([
      { expiresAfter: ago(0) },
      { expiresAfter: ago(1) },
      { expiresAfter: ago(1) },
      { expiresAfter: ago(45) },
    ]);
    await mongo.client.db("user").collection("email_send_log").insertMany([{ sentAt: ago(0.5) }, { sentAt: ago(2) }]);

    const s = await getDashboardStatsService({ now: NOW });
    expect(s.totals).toMatchObject({ teachers: 3, students: 1, activeClasses: 2, trashedClasses: 1 });
    expect(s.active).toEqual({ teachers7d: 1, teachers30d: 2, students7d: 1 });
    expect(s.email.last24h).toBe(1);

    expect(s.signupsByDay).toHaveLength(30);
    expect(s.signupsByDay.at(-1)).toEqual({ date: "2026-10-05", count: 2 });
    expect(s.signupsByDay.reduce((a, d) => a + d.count, 0)).toBe(2); // 40일 전 가입은 제외

    expect(s.historyByDay.at(-1).count).toBe(1);
    expect(s.historyByDay.at(-2)).toEqual({ date: "2026-10-04", count: 2 });
  });

  it("최근 주·달 키 (월요일 시작, 한국 시간)", () => {
    const now = new Date("2026-10-04T16:00:00Z"); // 한국 10/5(월) 01시
    const weeks = lastWeekKeys(now);
    expect(weeks).toHaveLength(12);
    expect(weeks.at(-1)).toBe("2026-10-05");
    expect(weeks.at(-2)).toBe("2026-09-28");
    const months = lastMonthKeys(now);
    expect(months).toHaveLength(12);
    expect(months.at(-1)).toBe("2026-10");
    expect(months[0]).toBe("2025-11");
  });

  it("일·주·월별 이용 (기록 전 기간은 null)", async () => {
    const admins = mongo.client.db("admins");
    await admins.collection("daily_usage").insertMany([
      { _id: "2026-09-28", students: 4, kioskUses: 1 }, // 9/28(월) 주, 9월 — 첫 기록
      { _id: "2026-10-03", students: 5, kioskUses: 2 }, // 9/28 주, 10월
      { _id: "2026-10-05", teachers: 2, students: 30, kioskUses: 7 }, // 10/5 주
    ]);
    await admins.collection("period_usage").insertMany([
      { _id: "w:2026-10-05", teachers: 2, students: 30 },
      { _id: "m:2026-10", teachers: 3, students: 31 },
    ]);
    const { usage } = await getDashboardStatsService({ now: NOW });

    expect(usage.day).toHaveLength(30);
    expect(usage.day.at(-1)).toEqual({ key: "2026-10-05", teachers: 2, students: 30, kioskUses: 7 });
    expect(usage.day.at(-2)).toEqual({ key: "2026-10-04", teachers: 0, students: 0, kioskUses: 0 });
    expect(usage.day.find((d) => d.key === "2026-09-27")).toEqual({ key: "2026-09-27", teachers: null, students: null, kioskUses: null });

    expect(usage.week).toHaveLength(12);
    expect(usage.week.at(-1)).toEqual({ key: "2026-10-05", teachers: 2, students: 30, kioskUses: 7 });
    // 주별 사람 수 기록이 없는 주는 null, 키오스크는 일별 합
    expect(usage.week.at(-2)).toEqual({ key: "2026-09-28", teachers: null, students: null, kioskUses: 3 });
    expect(usage.week.at(-3).kioskUses).toBeNull();

    expect(usage.month.at(-1)).toEqual({ key: "2026-10", teachers: 3, students: 31, kioskUses: 9 });
    expect(usage.month.at(-2)).toEqual({ key: "2026-09", teachers: null, students: null, kioskUses: 1 });
    expect(usage.month.at(-3).kioskUses).toBeNull();
  });
});
