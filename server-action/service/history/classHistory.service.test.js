import { describe, it, expect, vi } from "vitest";
import { ObjectId } from "mongodb";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo, makeScope } = await import("@/test/helpers/testMongo");
const { getClassHistoryService, periodStart, decodeCursor } = await import("./classHistory.service.js");

const mongo = setupTestMongo();
const s = makeScope();
const other = makeScope();
const NOW = new Date("2026-10-22T03:00:00Z"); // 한국 10/22 12시
const at = (h) => new Date(NOW.getTime() - h * 3600_000);
const base = (scope) => ({ teacher_id: scope.teacherObjectId, classId: scope.classObjectId });
const get = (opts = {}) => getClassHistoryService({ teacherObjectId: s.teacherObjectId, classObjectId: s.classObjectId, now: NOW, ...opts });

async function seed() {
  await mongo.db.collection("history").insertMany([
    { ...base(s), userId: "a", name: "선생님에게 받음", type: "입금", amount: 10, balance: 10, date: at(1) },
    { ...base(s), userId: "b", name: "선생님에게 받음", type: "입금", amount: 10, balance: 20, date: at(1) },
    { ...base(s), userId: "a", name: "연필 구입", type: "출금", amount: 3, balance: 7, date: at(5) },
    { ...base(s), userId: "a", name: "아이템 사용: 연필", type: "출금", amount: 0, kind: "itemUse", date: at(6) },
    { ...base(s), userId: "b", name: "퀘스트 완료", type: "입금", amount: 5, date: at(30) }, // 어제
    { ...base(s), userId: "b", name: "기부", type: "출금", amount: 2, date: at(24 * 10) }, // 10일 전
    { ...base(other), userId: "x", name: "선생님에게 받음", type: "입금", amount: 99, date: at(1) }, // 다른 반
    { userId: "a", name: "예전 형식", type: "입금", amount: 1, date: at(2) }, // 학급 정보 없음
  ]);
}

describe("학급 기록", () => {
  it("이 반 기록만 최신순으로", async () => {
    await seed();
    const { rows, nextCursor } = await get();
    expect(rows.map((r) => r.name)).toEqual(["선생님에게 받음", "선생님에게 받음", "연필 구입", "아이템 사용: 연필", "퀘스트 완료", "기부"]);
    expect(nextCursor).toBeNull();
    expect(typeof rows[0]._id).toBe("string");
  });

  it("종류·학생·기간으로 거른다", async () => {
    await seed();
    expect((await get({ kinds: ["buy"] })).rows.map((r) => r.name)).toEqual(["연필 구입"]);
    expect((await get({ kinds: ["use"] })).rows.map((r) => r.name)).toEqual(["아이템 사용: 연필"]);
    expect((await get({ kinds: ["buy", "donate"] })).rows.map((r) => r.name)).toEqual(["연필 구입", "기부"]);
    expect((await get({ kinds: ["grant", "take", "buy", "quest", "donate", "use"] })).rows).toHaveLength(6); // 전부 고르면 거르지 않음
    expect((await get({ kinds: ["grant"] })).rows).toHaveLength(2);
    expect((await get({ userId: "b" })).rows.map((r) => r.name)).toEqual(["선생님에게 받음", "퀘스트 완료", "기부"]);
    expect((await get({ period: "today" })).rows).toHaveLength(4); // 한국 오늘 0시 이후
    expect((await get({ period: "7d" })).rows).toHaveLength(5);
  });

  it("같은 시각 기록이 페이지 경계에 걸려도 빠지거나 겹치지 않는다", async () => {
    await seed();
    const p1 = await get({ limit: 1 });
    const p2 = await get({ limit: 1, cursor: p1.nextCursor });
    const p3 = await get({ limit: 10, cursor: p2.nextCursor });
    const ids = [...p1.rows, ...p2.rows, ...p3.rows].map((r) => r._id);
    expect(new Set(ids).size).toBe(6);
    expect(p3.nextCursor).toBeNull();
  });

  it("기간 시작·잘못된 cursor", () => {
    expect(periodStart("today", NOW).toISOString()).toBe("2026-10-21T15:00:00.000Z");
    expect(periodStart("all", NOW)).toBeNull();
    expect(decodeCursor("nope")).toBeNull();
    expect(decodeCursor(`${NOW.toISOString()}_${new ObjectId().toHexString()}`)).not.toBeNull();
  });
});
