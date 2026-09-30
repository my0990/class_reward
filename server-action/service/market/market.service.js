// server-action/service/item/item.service.js
import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { toNonNegativeInt } from "@/util/number/toNonNegativeInt";

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

  if (!ObjectId.isValid(teacher_id) || !ObjectId.isValid(classId)) {
    throw new Error("잘못된 학급 정보입니다.");
  }

  const trimmedName = String(itemName ?? "").trim();
  if (!trimmedName) {
    throw new Error("아이템 이름을 입력해주세요.");
  }

  // 가격/재고는 항상 0 이상의 정수(number)로 저장한다. 문자열로 저장되면 구매가 실패한다.
  const numericPrice = toNonNegativeInt(itemPrice);
  const numericStock = toNonNegativeInt(itemStock);

  if (numericPrice === null) {
    throw new Error("아이템 가격은 0 이상의 정수로 입력해주세요.");
  }

  if (numericStock === null) {
    throw new Error("아이템 재고는 0 이상의 정수로 입력해주세요.");
  }

  const db = (await connectDB).db("data");

  const itemId = new ObjectId().toString();

  const result = await db.collection("class_data").updateOne(
    {
      teacher_id: ObjectId.createFromHexString(teacher_id),
      classId: ObjectId.createFromHexString(classId),
    },
    {
      $push: {
        itemList: {
          itemId,
          itemPrice: numericPrice,
          itemName: trimmedName,
          itemStock: numericStock,
          itemExplanation,
          emoji,
        },
      },
    }
  );

  // upsert를 쓰지 않는다: 학급(class_data)은 학급 생성 시 만들어지므로,
  // 없으면 잘못된 teacher_id/classId다. upsert하면 엉뚱한 빈 학급 문서가 생긴다.
  if (result.matchedCount === 0) {
    throw new Error("학급 정보를 찾을 수 없습니다.");
  }

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

function httpError(message, status) {
  return Object.assign(new Error(message), { status });
}

/**
 * 학생 아이템 구매 (학생 대시보드 마켓, 교사 키오스크 공용)
 * - 가격/이름 등은 클라이언트 값이 아니라 서버의 학급 카탈로그(class_data.itemList) 값을 쓴다.
 * - 트랜잭션 + 조건부 차감으로 동시에 여러 번 눌러도 잔액/재고가 음수가 되지 않는다.
 * - 예전 데이터의 문자열 가격/재고("100")는 정수로 바꿔 쓰고 DB 값도 고쳐 둔다.
 * 실패 시 status(400/404/500)가 붙은 Error를 던진다.
 */
export async function buyItemService({ teacher_id, classId, userId, itemId }) {
  if (!userId || !itemId) {
    throw httpError("잘못된 요청입니다.", 400);
  }

  let teacherObjectId;
  let classObjectId;
  try {
    teacherObjectId = ObjectId.createFromHexString(teacher_id);
    classObjectId = ObjectId.createFromHexString(classId);
  } catch {
    throw httpError("잘못된 학급 정보입니다.", 400);
  }

  const scope = { teacher_id: teacherObjectId, classId: classObjectId };
  const studentFilter = { ...scope, userId, role: "student" };

  const client = await connectDB;
  const db = client.db("data");
  const session = client.startSession();

  let purchasedItemId = null;

  try {
    await session.withTransaction(async () => {
      const classData = await db.collection("class_data").findOne(scope, { session });
      if (!classData) {
        throw httpError("학급 정보를 찾을 수 없습니다.", 404);
      }

      const item = classData.itemList?.find((i) => i.itemId === itemId);
      if (!item) {
        throw httpError("존재하지 않는 아이템입니다.", 404);
      }

      const price = toNonNegativeInt(item.itemPrice);
      const stock = toNonNegativeInt(item.itemStock);
      if (price === null || stock === null) {
        throw httpError("아이템 가격 또는 재고 정보가 올바르지 않습니다. 선생님께 문의해 주세요.", 500);
      }

      if (item.itemPrice !== price || item.itemStock !== stock) {
        await db.collection("class_data").updateOne(
          { ...scope, "itemList.itemId": itemId },
          { $set: { "itemList.$.itemPrice": price, "itemList.$.itemStock": stock } },
          { session }
        );
      }

      const studentData = await db.collection("user_data").findOne(studentFilter, { session });
      if (!studentData) {
        throw httpError("사용자 정보를 찾을 수 없습니다.", 404);
      }

      if (studentData.money < price) {
        throw httpError("잔액부족", 400);
      }

      // 재고가 남아있을 때만 원자적으로 차감 (동시 요청에 의한 오버셀 방지)
      const stockUpdate = await db.collection("class_data").updateOne(
        { ...scope, itemList: { $elemMatch: { itemId, itemStock: { $gt: 0 } } } },
        { $inc: { "itemList.$.itemStock": -1 } },
        { session }
      );
      if (stockUpdate.matchedCount === 0) {
        throw httpError("아이템 품절", 400);
      }

      purchasedItemId = new ObjectId().toString();

      // 잔액이 충분할 때만 원자적으로 차감 (동시 요청에 의한 이중 지출 방지)
      const moneyUpdate = await db.collection("user_data").updateOne(
        { ...studentFilter, money: { $gte: price } },
        {
          $push: {
            itemList: {
              itemName: item.itemName,
              itemPrice: price,
              itemId: purchasedItemId,
              emoji: item.emoji,
              itemExplanation: item.itemExplanation,
            },
          },
          $inc: { money: -price },
        },
        { session }
      );
      if (moneyUpdate.matchedCount === 0) {
        // 트랜잭션이라 여기서 throw하면 위의 재고 차감도 함께 롤백된다.
        throw httpError("잔액부족", 400);
      }

      await db.collection("history").insertOne(
        {
          ...scope,
          userId,
          balance: studentData.money - price,
          type: "출금",
          amount: price,
          date: new Date(),
          expiresAfter: new Date(),
          name: item.itemName + " 구입",
        },
        { session }
      );
    });

    return { itemId: purchasedItemId };
  } finally {
    await session.endSession();
  }
}
