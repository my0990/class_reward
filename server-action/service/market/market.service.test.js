import { describe, it, expect, vi } from "vitest";
import { ObjectId } from "mongodb";
import {
  setupTestMongo,
  makeScope,
  seedStudent,
  seedClassData,
  getStudent,
} from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const { createItemService, updateItemService, deleteItemService, buyItemService } = await import(
  "./market.service.js"
);

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope(); // 다른 교사의 다른 학급

async function getItems(s = scope) {
  const doc = await mongo.db
    .collection("class_data")
    .findOne({ teacher_id: s.teacherObjectId, classId: s.classObjectId });
  return doc?.itemList ?? [];
}

async function seedItem(fields = {}) {
  const item = {
    itemId: new ObjectId().toString(),
    itemName: "사탕",
    itemPrice: 100,
    itemStock: 5,
    emoji: "🍬",
    itemExplanation: "달콤한 사탕",
    ...fields,
  };
  await seedClassData(mongo.db, scope, { itemList: [item] });
  return item;
}

const buy = (userId, itemId, s = scope) =>
  buyItemService({ teacher_id: s.teacher_id, classId: s.classId, userId, itemId });

describe("createItemService (아이템 등록)", () => {
  it("가격/재고를 정수(number)로 저장하고 이름 앞뒤 공백을 지운다", async () => {
    await seedClassData(mongo.db, scope);

    await createItemService({
      teacher_id: scope.teacher_id,
      classId: scope.classId,
      itemName: "  사탕  ",
      itemPrice: "1,000",
      itemStock: "3",
      emoji: "🍬",
    });

    const [item] = await getItems();
    expect(item.itemName).toBe("사탕");
    expect(item.itemPrice).toBe(1000);
    expect(item.itemStock).toBe(3);
    expect(typeof item.itemId).toBe("string");
  });

  it.each(["", "   ", "1.5", "-1", "abc", "1e3"])("가격이 %j이면 거부한다", async (price) => {
    await seedClassData(mongo.db, scope);
    await expect(
      createItemService({ teacher_id: scope.teacher_id, classId: scope.classId, itemName: "사탕", itemPrice: price, itemStock: 1 })
    ).rejects.toThrow("가격");
    expect(await getItems()).toHaveLength(0);
  });

  it("재고가 정수가 아니면 거부한다", async () => {
    await seedClassData(mongo.db, scope);
    await expect(
      createItemService({ teacher_id: scope.teacher_id, classId: scope.classId, itemName: "사탕", itemPrice: 10, itemStock: "2.5" })
    ).rejects.toThrow("재고");
  });

  it("이름이 비어 있으면 거부한다", async () => {
    await seedClassData(mongo.db, scope);
    await expect(
      createItemService({ teacher_id: scope.teacher_id, classId: scope.classId, itemName: "   ", itemPrice: 10, itemStock: 1 })
    ).rejects.toThrow("이름");
  });

  it("없는 학급에는 등록되지 않고, 빈 학급 문서도 새로 생기지 않는다", async () => {
    await expect(
      createItemService({ teacher_id: other.teacher_id, classId: other.classId, itemName: "사탕", itemPrice: 10, itemStock: 1 })
    ).rejects.toThrow("학급 정보를 찾을 수 없습니다.");
    expect(await mongo.db.collection("class_data").countDocuments()).toBe(0);
  });
});

describe("updateItemService (아이템 수정)", () => {
  it("가격/재고를 수정한다", async () => {
    const item = await seedItem();
    const res = await updateItemService({
      teacher_id: scope.teacher_id,
      classId: scope.classId,
      itemId: item.itemId,
      itemStock: 9,
      itemPrice: 250,
    });
    expect(res.isChanged).toBe(true);
    const [saved] = await getItems();
    expect(saved.itemStock).toBe(9);
    expect(saved.itemPrice).toBe(250);
  });

  it("값이 같으면 isChanged=false", async () => {
    const item = await seedItem();
    const res = await updateItemService({
      teacher_id: scope.teacher_id, classId: scope.classId, itemId: item.itemId, itemStock: 5, itemPrice: 100,
    });
    expect(res.isChanged).toBe(false);
  });

  it("다른 교사는 수정할 수 없다", async () => {
    const item = await seedItem();
    await expect(
      updateItemService({ teacher_id: other.teacher_id, classId: scope.classId, itemId: item.itemId, itemStock: 0, itemPrice: 0 })
    ).rejects.toThrow("찾을 수 없습니다");
    const [saved] = await getItems();
    expect(saved.itemPrice).toBe(100);
  });
});

describe("deleteItemService (아이템 삭제)", () => {
  it("아이템을 삭제한다", async () => {
    const item = await seedItem();
    await deleteItemService({ teacher_id: scope.teacher_id, classId: scope.classId, itemId: item.itemId });
    expect(await getItems()).toHaveLength(0);
  });

  it("다른 교사는 삭제할 수 없다", async () => {
    const item = await seedItem();
    await expect(
      deleteItemService({ teacher_id: other.teacher_id, classId: scope.classId, itemId: item.itemId })
    ).rejects.toThrow("찾을 수 없습니다");
    expect(await getItems()).toHaveLength(1);
  });

  it("없는 아이템이면 에러", async () => {
    await seedItem();
    await expect(
      deleteItemService({ teacher_id: scope.teacher_id, classId: scope.classId, itemId: "nope" })
    ).rejects.toThrow("찾을 수 없습니다");
  });
});

describe("buyItemService (아이템 구매)", () => {
  it("잔액과 재고를 차감하고, 인벤토리에 넣고, 거래 기록을 남긴다", async () => {
    const item = await seedItem({ itemPrice: 100, itemStock: 5 });
    await seedStudent(mongo.db, scope, { userId: "s1", money: 300 });

    const { itemId } = await buy("s1", item.itemId);

    const student = await getStudent(mongo.db, "s1");
    expect(student.money).toBe(200);
    expect(student.itemList).toHaveLength(1);
    expect(student.itemList[0]).toMatchObject({ itemName: "사탕", itemPrice: 100, itemId });
    expect(itemId).not.toBe(item.itemId); // 구매할 때마다 새 id

    const [saved] = await getItems();
    expect(saved.itemStock).toBe(4);

    const history = await mongo.db.collection("history").findOne({ userId: "s1" });
    expect(history).toMatchObject({ type: "출금", amount: 100, balance: 200, name: "사탕 구입" });
    expect(history.teacher_id).toBeInstanceOf(ObjectId);
    expect(history.teacher_id.toString()).toBe(scope.teacher_id);
  });

  it("잔액이 부족하면 구매되지 않고 아무것도 바뀌지 않는다", async () => {
    const item = await seedItem({ itemPrice: 100 });
    await seedStudent(mongo.db, scope, { userId: "s1", money: 99 });

    await expect(buy("s1", item.itemId)).rejects.toMatchObject({ message: "잔액부족", status: 400 });

    expect((await getStudent(mongo.db, "s1")).money).toBe(99);
    expect((await getItems())[0].itemStock).toBe(5);
    expect(await mongo.db.collection("history").countDocuments()).toBe(0);
  });

  it("재고가 0이면 품절", async () => {
    const item = await seedItem({ itemStock: 0 });
    await seedStudent(mongo.db, scope, { userId: "s1", money: 1000 });

    await expect(buy("s1", item.itemId)).rejects.toThrow("아이템 품절");
    expect((await getStudent(mongo.db, "s1")).money).toBe(1000);
  });

  it("DB에 가격/재고가 문자열로 저장돼 있어도 구매되고, DB 값이 정수로 고쳐진다", async () => {
    const item = await seedItem({ itemPrice: "100", itemStock: "5" });
    await seedStudent(mongo.db, scope, { userId: "s1", money: 150 });

    await buy("s1", item.itemId);

    expect((await getStudent(mongo.db, "s1")).money).toBe(50);
    const [saved] = await getItems();
    expect(saved.itemPrice).toBe(100);
    expect(saved.itemStock).toBe(4);
  });

  it("가격이 숫자로 바꿀 수 없는 값이면 구매를 막는다", async () => {
    const item = await seedItem({ itemPrice: "abc" });
    await seedStudent(mongo.db, scope, { userId: "s1", money: 1000 });

    await expect(buy("s1", item.itemId)).rejects.toMatchObject({ status: 500 });
    expect((await getStudent(mongo.db, "s1")).money).toBe(1000);
  });

  it("없는 아이템이면 404", async () => {
    await seedItem();
    await seedStudent(mongo.db, scope, { userId: "s1", money: 1000 });
    await expect(buy("s1", "nope")).rejects.toMatchObject({ message: "존재하지 않는 아이템입니다.", status: 404 });
  });

  it("다른 교사의 학급 정보로는 구매할 수 없다", async () => {
    const item = await seedItem();
    await seedStudent(mongo.db, scope, { userId: "s1", money: 1000 });

    await expect(buy("s1", item.itemId, other)).rejects.toMatchObject({ status: 404 });
    expect((await getStudent(mongo.db, "s1")).money).toBe(1000);
  });

  it("다른 학급 학생은 이 학급 아이템을 살 수 없다", async () => {
    const item = await seedItem();
    await seedStudent(mongo.db, other, { userId: "outsider", money: 1000 });

    await expect(buy("outsider", item.itemId)).rejects.toThrow("사용자 정보를 찾을 수 없습니다.");
    expect((await getItems())[0].itemStock).toBe(5);
  });

  it("잘못된 id 형식이면 400", async () => {
    await expect(
      buyItemService({ teacher_id: "bad", classId: "bad", userId: "s1", itemId: "x" })
    ).rejects.toMatchObject({ status: 400 });
  });

  it("잔액이 1개 값뿐일 때 동시에 두 번 눌러도 한 번만 구매된다", async () => {
    const item = await seedItem({ itemPrice: 100, itemStock: 10 });
    await seedStudent(mongo.db, scope, { userId: "s1", money: 100 });

    const results = await Promise.allSettled([buy("s1", item.itemId), buy("s1", item.itemId)]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const student = await getStudent(mongo.db, "s1");
    expect(student.money).toBe(0);
    expect(student.itemList).toHaveLength(1);
    expect((await getItems())[0].itemStock).toBe(9);
    expect(await mongo.db.collection("history").countDocuments()).toBe(1);
  });

  it("재고가 1개일 때 두 학생이 동시에 사도 한 명만 산다", async () => {
    const item = await seedItem({ itemStock: 1 });
    await seedStudent(mongo.db, scope, { userId: "s1", money: 1000 });
    await seedStudent(mongo.db, scope, { userId: "s2", money: 1000 });

    const results = await Promise.allSettled([buy("s1", item.itemId), buy("s2", item.itemId)]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect((await getItems())[0].itemStock).toBe(0);
    const s1 = await getStudent(mongo.db, "s1");
    const s2 = await getStudent(mongo.db, "s2");
    expect(s1.money + s2.money).toBe(1900);
  });
});
