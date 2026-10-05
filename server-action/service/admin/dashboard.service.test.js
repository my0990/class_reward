import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo } = await import("@/test/helpers/testMongo");
const { getDashboardStatsService, lastDayKeys } = await import("@/server-action/service/admin/dashboard.service");

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
});
