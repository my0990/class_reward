import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo } = await import("@/test/helpers/testMongo");
const { recordError, DAILY_NEW_CAP } = await import("./errorLog.js");
const { getRecentErrorsService } = await import("@/server-action/service/admin/errorLog.service.js");

const mongo = setupTestMongo();
const NOW = new Date("2026-10-26T03:00:00Z");
const admins = () => mongo.client.db("admins");
const col = () => admins().collection("error_logs");

beforeEach(async () => {
  await col().deleteMany({});
  await col().createIndex({ fp: 1, day: 1 }, { unique: true });
});

describe("에러 기록", () => {
  it("같은 에러는 하루 한 줄로 묶고 횟수만 올린다", async () => {
    const e = { source: "action", message: "createQuest error: boom", stack: "Error: boom\n    at createQuest (a.js:1:1)", path: "/teacher/x?tab=1", role: "teacher" };
    await recordError(e, { db: admins(), now: NOW });
    await recordError(e, { db: admins(), now: new Date(NOW.getTime() + 60_000) });
    const docs = await col().find().toArray();
    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({ count: 2, source: "action", path: "/teacher/x", role: "teacher", day: "2026-10-26" });
  });

  it("개인 정보를 가리고, 이상한 값은 걸러서 저장한다", async () => {
    await recordError({ source: "hack", message: "no user a@b.com", role: "root" }, { db: admins(), now: NOW });
    const [d] = await col().find().toArray();
    expect(d.message).toBe("no user [email]");
    expect(d.source).toBe("server");
    expect(d.role).toBeNull();
  });

  it("기기·배포 버전을 모아 둔다 (같은 값은 한 번만, 이상한 버전 값은 버림)", async () => {
    const e = { source: "client", message: "x 에러" };
    await recordError({ ...e, device: "iPad · Safari 17", build: "abc1234" }, { db: admins(), now: NOW });
    await recordError({ ...e, device: "iPad · Safari 17", build: "def5678" }, { db: admins(), now: NOW });
    await recordError({ ...e, device: "Windows · Chrome 130", build: "<script>" }, { db: admins(), now: NOW });
    const [d] = await col().find().toArray();
    expect(d.devices.sort()).toEqual(["Windows · Chrome 130", "iPad · Safari 17"]);
    expect(d.builds.sort()).toEqual(["abc1234", "def5678"]);
  });

  it("무시할 에러는 저장하지 않는다", async () => {
    const r = await recordError({ source: "client", message: "ResizeObserver loop limit exceeded" }, { db: admins(), now: NOW });
    expect(r.skipped).toBe("noise");
    expect(await col().countDocuments()).toBe(0);
  });

  it("하루 새 종류는 상한까지만", async () => {
    await col().insertMany(Array.from({ length: DAILY_NEW_CAP }, (_, i) => ({ fp: `f${i}`, day: "2026-10-26", count: 1, lastAt: NOW })));
    const r = await recordError({ source: "client", message: "새 에러" }, { db: admins(), now: NOW });
    expect(r.skipped).toBe("cap");
  });

  it("개발·테스트 환경에서는 DB를 안 주면 기록하지 않는다", async () => {
    expect((await recordError({ message: "x" })).skipped).toBe("disabled");
  });
});

describe("관리자 '최근 에러'", () => {
  it("종류별로 묶어 최근 순으로, 오늘 건수와 함께", async () => {
    const a = { source: "client", message: "A 에러", stack: "at a (a.js:1:1)" };
    const b = { source: "api", message: "B 에러", stack: "at b (b.js:1:1)" };
    const yesterday = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
    await recordError({ ...a, role: "student" }, { db: admins(), now: yesterday });
    await recordError({ ...a, role: "teacher" }, { db: admins(), now: NOW });
    await recordError(b, { db: admins(), now: new Date(NOW.getTime() - 60_000) });

    const r = await getRecentErrorsService({ db: admins(), now: NOW });
    expect(r.items.map((i) => i.message)).toEqual(["A 에러", "B 에러"]);
    expect(r.items[0]).toMatchObject({ count: 2, roles: ["student", "teacher"] });
    expect(r.today).toEqual({ count: 2, kinds: 2 });
    expect(r.recentCount).toBe(3);
  });
});
