import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo } = await import("@/test/helpers/testMongo");
const { dayKey, weekKey, monthKey, isFirstVisitToday, touchLastSeen, bumpDailyUsage } = await import("./dailyUsage.js");

const mongo = setupTestMongo();
const usage = () => mongo.client.db("admins").collection("daily_usage");
const users = () => mongo.client.db("user").collection("users");
const periods = () => mongo.client.db("admins").collection("period_usage");

beforeEach(async () => {
  await usage().deleteMany({});
  await periods().deleteMany({});
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

  it("주(월요일 시작)·달 키도 한국 날짜 기준", () => {
    expect(weekKey(new Date("2026-10-18T15:30:00Z"))).toBe("2026-10-19"); // 한국 10/19(월) 00:30
    expect(weekKey(new Date("2026-10-18T14:30:00Z"))).toBe("2026-10-12"); // 한국 10/18(일) 23:30
    expect(weekKey(new Date("2026-10-25T03:00:00Z"))).toBe("2026-10-19"); // 일요일은 그 주 마지막 날
    expect(monthKey(new Date("2026-10-31T15:30:00Z"))).toBe("2026-11"); // 한국 11/1
  });

  it("주·달 접속자는 그 기간에 한 번만 센다", async () => {
    const { insertedId } = await users().insertOne({ role: "teacher", email: "t" });
    const visit = (iso) => touchLastSeen(users(), { _id: insertedId }, { role: "teacher", now: new Date(iso) });
    await visit("2026-10-19T01:00:00Z"); // 10/19(월)
    await visit("2026-10-20T01:00:00Z"); // 같은 주 다른 날
    await visit("2026-10-20T02:00:00Z"); // 같은 날
    expect(await periods().findOne({ _id: "w:2026-10-19" })).toMatchObject({ teachers: 1 });
    expect(await periods().findOne({ _id: "m:2026-10" })).toMatchObject({ teachers: 1 });
    expect((await usage().findOne({ _id: "2026-10-20" })).teachers).toBe(1);

    await visit("2026-10-26T01:00:00Z"); // 다음 주, 같은 달
    expect(await periods().findOne({ _id: "w:2026-10-26" })).toMatchObject({ teachers: 1 });
    expect((await periods().findOne({ _id: "m:2026-10" })).teachers).toBe(1);

    await visit("2026-11-02T01:00:00Z"); // 다음 달
    expect(await periods().findOne({ _id: "m:2026-11" })).toMatchObject({ teachers: 1 });

    await bumpDailyUsage("kiosk", new Date("2026-11-02T01:00:00Z"));
    expect(await periods().countDocuments({ kioskUses: { $exists: true } })).toBe(0); // 키오스크는 일별만 저장
  });
});
