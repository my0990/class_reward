import { describe, it, expect, vi } from "vitest";
import { setupTestMongo, makeScope, seedStudent, getStudent } from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const { useItemService } = await import("./item.service.js");

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope();

const candy = { itemId: "item-1", itemName: "사탕", itemPrice: 100 };
const snack = { itemId: "item-2", itemName: "과자", itemPrice: 200 };

const use = (userId, itemId, s = scope) =>
  useItemService({ teacher_id: s.teacher_id, classId: s.classId, userId, itemId });

describe("useItemService (아이템 사용)", () => {
  it("인벤토리에서 해당 아이템만 빠지고 사용 기록이 남는다", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", money: 500, itemList: [candy, snack] });

    const res = await use("s1", "item-1");

    expect(res.result).toBe(true);
    const student = await getStudent(mongo.db, "s1");
    expect(student.itemList.map((i) => i.itemId)).toEqual(["item-2"]);
    expect(student.money).toBe(500); // 사용은 돈이 들지 않는다

    const history = await mongo.db.collection("history").findOne({ userId: "s1" });
    expect(history).toMatchObject({ name: "아이템 사용 (사탕)", amount: 0, balance: 500 });
  });

  it("없는 아이템이면 에러", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", itemList: [candy] });

    await expect(use("s1", "nope")).rejects.toThrow("아이템이 존재하지 않음");
    expect((await getStudent(mongo.db, "s1")).itemList).toHaveLength(1);
    expect(await mongo.db.collection("history").countDocuments()).toBe(0);
  });

  it("같은 아이템을 동시에 두 번 사용해도 한 번만 처리된다", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", itemList: [candy] });

    const results = await Promise.allSettled([use("s1", "item-1"), use("s1", "item-1")]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await mongo.db.collection("history").countDocuments()).toBe(1);
  });

  it("다른 학급 학생의 아이템은 사용할 수 없다", async () => {
    await seedStudent(mongo.db, other, { userId: "outsider", itemList: [candy] });

    await expect(use("outsider", "item-1")).rejects.toThrow("사용자 정보를 찾을 수 없습니다.");
    expect((await getStudent(mongo.db, "outsider")).itemList).toHaveLength(1);
  });

  it("userId나 itemId가 없으면 에러", async () => {
    await expect(use("", "item-1")).rejects.toThrow("잘못된 요청입니다.");
    await expect(use("s1", "")).rejects.toThrow("잘못된 요청입니다.");
  });

  it("잘못된 id 형식이면 에러", async () => {
    await expect(
      useItemService({ teacher_id: "bad", classId: "bad", userId: "s1", itemId: "item-1" })
    ).rejects.toThrow("잘못된 학급 정보입니다.");
  });
});
