import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo } = await import("@/test/helpers/testMongo");
const { dayKey, isFirstVisitToday, touchLastSeen, bumpDailyUsage } = await import("./dailyUsage.js");

const mongo = setupTestMongo();
const usage = () => mongo.client.db("admins").collection("daily_usage");
const users = () => mongo.client.db("user").collection("users");

beforeEach(async () => {
  await usage().deleteMany({});
  await users().deleteMany({});
});

describe("일별 이용 수", () => {
  it("한국 날짜 기준", () => {
    expect(dayKey(new Date("2026-10-18T15:30:00Z"))).toBe("2026-10-19"); // 한국 10/19 00:30
    const now = new Date("2026-10-19T03:00:00Z");
    expect(isFirstVisitToday(null, now)).toBe(true);
    expect(isFirstVisitToday(new Date("2026-10-18T14:59:00Z"), now)).toBe(true); // 한국 10/18 23:59
    expect(isFirstVisitToday(new Date("2026-10-18T15:01:00Z"), now)).toBe(false); // 한국 10/19 00:01
  });

  it("같은 사람은 하루 한 번만, 다음 날 다시", async () => {
    const { insertedId } = await users().insertOne({ role: "student", userId: "s1" });
    const day1 = new Date("2026-10-19T01:00:00Z");
    await touchLastSeen(users(), { _id: insertedId }, { role: "student", now: day1 });
    await touchLastSeen(users(), { _id: insertedId }, { role: "student", now: new Date(day1.getTime() + 3600_000) });
    expect((await usage().findOne({ _id: "2026-10-19" })).students).toBe(1);

    await touchLastSeen(users(), { _id: insertedId }, { role: "student", now: new Date("2026-10-20T01:00:00Z") });
    expect((await usage().findOne({ _id: "2026-10-20" })).students).toBe(1);
    expect((await users().findOne({ _id: insertedId })).lastSeenAt).toEqual(new Date("2026-10-20T01:00:00Z"));
  });

  it("없는 사용자·모르는 종류는 세지 않음, 키오스크는 매번", async () => {
    await touchLastSeen(users(), { userId: "none" }, { role: "student" });
    await bumpDailyUsage("admin");
    expect(await usage().countDocuments()).toBe(0);

    const now = new Date("2026-10-19T01:00:00Z");
    await bumpDailyUsage("kiosk", now);
    await bumpDailyUsage("kiosk", now);
    expect((await usage().findOne({ _id: "2026-10-19" })).kioskUses).toBe(2);
  });
});
