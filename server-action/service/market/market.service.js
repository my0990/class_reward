// server-action/service/item/item.service.js
import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function createItemService({
  teacher_id,
  classId,
  itemName,
  itemPrice,
  itemStock,
  itemExplanation,
  emoji,
}) {
  if (!teacher_id) {
    throw new Error("teacher_id가 없습니다.");
  }

  if (!classId) {
    throw new Error("classId가 없습니다.");
  }

  if (!itemName) {
    throw new Error("아이템 이름을 입력해주세요.");
  }

  const numericPrice = Number(itemPrice);
  const numericStock = Number(itemStock);

  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    throw new Error("아이템 가격이 올바르지 않습니다.");
  }

  if (Number.isNaN(numericStock) || numericStock < 0) {
    throw new Error("아이템 재고가 올바르지 않습니다.");
  }

  const db = (await connectDB).db("data");

  const itemId = new ObjectId().toString();

  await db.collection("class_data").updateOne(
    {
      teacher_id: ObjectId.createFromHexString(teacher_id),
      classId: ObjectId.createFromHexString(classId),
    },
    {
      $push: {
        itemList: {
          itemId,
          itemPrice: numericPrice,
          itemName,
          itemStock: numericStock,
          itemExplanation,
          emoji,
        },
      },
    },
    { upsert: true }
  );

  return {
    itemId,
  };
}

export async function deleteItemService({
  teacher_id,
  classId,
  itemId,
}) {
  if (!ObjectId.isValid(teacher_id)) {
      throw new Error("유효하지 않은 교사 ID입니다.");
  }

  if (!ObjectId.isValid(classId)) {
      throw new Error("유효하지 않은 학급 ID입니다.");
  }

  if (!itemId) {
      throw new Error("아이템 ID가 없습니다.");
  }

  const db = (await connectDB).db("data");

  const result = await db.collection("class_data").updateOne(
      {
        teacher_id: ObjectId.createFromHexString(teacher_id),
        classId: ObjectId.createFromHexString(classId),
          "itemList.itemId": itemId,
      },
      {
          $pull: {
              itemList: {
                  itemId,
              },
          },
      }
  );

  if (result.matchedCount === 0) {
      throw new Error("학급 또는 아이템을 찾을 수 없습니다.");
  }

  if (result.modifiedCount === 0) {
      throw new Error("아이템이 삭제되지 않았습니다.");
  }

  return {
      deletedItemId: itemId,
      modifiedCount: result.modifiedCount,
  };
}

export async function updateItemService({
  teacher_id,
  classId,
  itemId,
  itemStock,
  itemPrice,
}) {
  if (!ObjectId.isValid(teacher_id)) {
      throw new Error("유효하지 않은 교사 ID입니다.");
  }

  if (!ObjectId.isValid(classId)) {
      throw new Error("유효하지 않은 학급 ID입니다.");
  }

  if (!itemId) {
      throw new Error("아이템 ID가 없습니다.");
  }

  if (!Number.isInteger(itemStock) || itemStock < 0) {
      throw new Error("재고는 0 이상의 정수여야 합니다.");
  }

  if (!Number.isInteger(itemPrice) || itemPrice < 0) {
      throw new Error("가격은 0 이상의 정수여야 합니다.");
  }

  const db = (await connectDB).db("data");

  const response = await db.collection("class_data").updateOne(
      {
        teacher_id: ObjectId.createFromHexString(teacher_id),
        classId: ObjectId.createFromHexString(classId),
          "itemList.itemId": itemId,
      },
      {
          $set: {
              "itemList.$.itemStock": itemStock,
              "itemList.$.itemPrice": itemPrice,
          },
      }
  );

  if (response.matchedCount === 0) {
      throw new Error("학급 또는 아이템을 찾을 수 없습니다.");
  }

  if (response.modifiedCount === 0) {
      return {
          itemId,
          itemStock,
          itemPrice,
          isChanged: false,
      };
  }

  return {
      itemId,
      itemStock,
      itemPrice,
      isChanged: true,
  };
}