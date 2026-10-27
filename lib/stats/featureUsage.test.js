import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo } = await import("@/test/helpers/testMongo");
const { recordFeatureUse } = await import("./featureUsage.js");
const { getFeatureUsageService } = await import("@/server-action/service/admin/featureUsage.service.js");

const mongo = setupTestMongo();
const NOW = new Date("2026-10-27T03:00:00Z"); // 한국 10/27 낮
const DAY = 24 * 60 * 60 * 1000;
const admins = () => mongo.client.db("admins");
const A = new ObjectId().toHexString();
const B = new ObjectId().toHexString();

beforeEach(async () => {
  for (const db of [admins(), mongo.client.db("user")]) {
    const cols = await db.collections();
    await Promise.all(cols.map((c) => c.deleteMany({})));
  }
});

describe("기능 사용 세기", () => {
  it("하루·기능마다 한 문서: 횟수 +1, 쓴 반 id만 모은다", async () => {
    const db = admins();
    await recordFeatureUse("seat_confirm", { classId: A, db, now: NOW });
    await recordFeatureUse("seat_confirm", { classId: A, db, now: NOW });
    await recordFeatureUse("seat_confirm", { classId: B, db, now: NOW });
    const docs = await db.collection("feature_usage").find().toArray();
    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({ _id: "2026-10-27:seat_confirm", day: "2026-10-27", feature: "seat_confirm", count: 3 });
    expect(docs[0].classes.sort()).toEqual([A, B].sort());
  });

  it("모르는 기능·이상한 학급 id는 거른다", async () => {
    const db = admins();
    expect((await recordFeatureUse("hack", { db, now: NOW })).skipped).toBe("unknown");
    await recordFeatureUse("timer_start", { classId: "x", db, now: NOW });
    const d = await db.collection("feature_usage").findOne();
    expect(d.count).toBe(1);
    expect(d.classes).toBeUndefined();
  });

  it("개발·테스트 환경에서는 DB를 안 주면 세지 않는다", async () => {
    expect((await recordFeatureUse("timer_start", { classId: A })).skipped).toBe("disabled");
  });
});

describe("관리자 '기능 사용량'", () => {
  it("7일·30일 횟수와 쓴 반 수, 30일 추이, 설정해 둔 반", async () => {
    const db = admins();
    await recordFeatureUse("random_pick", { classId: A, db, now: NOW });
    await recordFeatureUse("random_pick", { classId: B, db, now: new Date(NOW.getTime() - 10 * DAY) });
    await recordFeatureUse("random_pick", { classId: B, db, now: new Date(NOW.getTime() - 40 * DAY) }); // 30일 밖

    const data = mongo.client.db("data");
    const ca = ObjectId.createFromHexString(A);
    const cb = ObjectId.createFromHexString(B);
    await data.collection("classes").insertMany([{ _id: ca }, { _id: cb }, { _id: new ObjectId(), deletedAt: NOW }]);
    await data.collection("class_data").insertMany([
      { classId: ca, seatPlan: { current: { assignment: {} } }, itemList: [{ name: "연필" }] },
      { classId: cb, itemList: [] },
    ]);
    await data.collection("quest").insertMany([{ classId: ca }, { classId: ca }, { classId: cb }]);
    await mongo.client.db("user").collection("kiosk_devices").insertMany([{ classId: ca }, { classId: cb, revokedAt: NOW }]);

    const r = await getFeatureUsageService({ client: mongo.client, now: NOW });
    const rp = r.items.find((i) => i.key === "random_pick");
    expect(rp).toMatchObject({ count7: 1, count30: 2, classes7: 1, classes30: 2 });
    expect(rp.series).toHaveLength(30);
    expect(rp.series.at(-1)).toEqual({ day: "2026-10-27", count: 1 });
    expect(r.items.find((i) => i.key === "seat_confirm").count30).toBe(0);
    expect(r.activeClasses).toBe(2);
    expect(Object.fromEntries(r.adoption.map((a) => [a.label, a.count]))).toMatchObject({
      "자리를 저장한 반": 1,
      "퀘스트를 만든 반": 2,
      "아이템을 등록한 반": 1,
      "키오스크를 연결한 반": 1,
    });
  });
});
