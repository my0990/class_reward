// server-action/action/item/item.action.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { toNonNegativeInt } from "@/util/number/toNonNegativeInt";
import { resolveStudentTarget, StudentTargetError } from "@/lib/auth/studentTarget";
import { buyItemService, createItemService, deleteItemService, updateItemService } from "@/server-action/service/market/market.service";

export async function createItem({
  itemName,
  itemPrice,
  itemStock,
  itemExplanation,
  emoji,
  classId,
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        result: false,
        message: "로그인이 필요합니다.",
      };
    }

    const teacher_id = session?.user?._id ?? null;

    const result = await createItemService({
      teacher_id,
      classId,
      itemName,
      itemPrice,
      itemStock,
      itemExplanation,
      emoji,
    });

    return {
      result: true,
      message: "아이템 생성 성공",
      data: result,
    };
  } catch (error) {
    console.error("createItemAction error:", error);

    return {
      result: false,
      message: error.message || "아이템 생성 실패",
    };
  }
}

export async function deleteItem({
  classId,
  itemId,
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?._id) {
      return {
        result: false,
        message: "로그인이 필요합니다.",
      };
    }

    if (!classId || !itemId) {
      return {
        result: false,
        message: "삭제할 아이템 정보가 올바르지 않습니다.",
      };
    }

    const data = await deleteItemService({
      teacher_id: session.user._id,
      classId,
      itemId,
    });

    return {
      result: true,
      message: "아이템을 삭제하였습니다.",
      data,
    };
  } catch (error) {
    console.error("deleteItem action error:", error);

    return {
      result: false,
      message:
        error instanceof Error
          ? error.message
          : "아이템 삭제 중 오류가 발생했습니다.",
    };
  }
}

export async function updateItem({
  classId,
  itemId,
  updatedItemStock,
  updatedItemPrice,
}) {
  try {
      const session = await getServerSession(authOptions);

      if (!session?.user?._id) {
          return {
              result: false,
              message: "로그인이 필요합니다.",
          };
      }

      if (!classId || !itemId) {
          return {
              result: false,
              message: "아이템 정보가 올바르지 않습니다.",
          };
      }

      if (
          updatedItemStock === "" ||
          updatedItemStock === null ||
          updatedItemStock === undefined
      ) {
          return {
              result: false,
              message: "재고를 입력해 주세요.",
          };
      }

      if (
          updatedItemPrice === "" ||
          updatedItemPrice === null ||
          updatedItemPrice === undefined
      ) {
          return {
              result: false,
              message: "가격을 입력해 주세요.",
          };
      }

      const itemStock = toNonNegativeInt(updatedItemStock);
      const itemPrice = toNonNegativeInt(updatedItemPrice);

      if (itemStock === null) {
          return {
              result: false,
              message: "재고는 0 이상의 정수로 입력해 주세요.",
          };
      }

      if (itemPrice === null) {
          return {
              result: false,
              message: "가격은 0 이상의 정수로 입력해 주세요.",
          };
      }

      const data = await updateItemService({
          teacher_id: session.user._id,
          classId,
          itemId,
          itemStock,
          itemPrice,
      });

      return {
          result: true,
          message: data.isChanged
              ? "아이템 정보를 수정하였습니다."
              : "변경된 내용이 없습니다.",
          data,
      };
  } catch (error) {
      console.error("updateItem action error:", error);

      return {
          result: false,
          message:
              error instanceof Error
                  ? error.message
                  : "아이템 수정 중 오류가 발생했습니다.",
      };
  }
}

// 학생 아이템 구매 (예전 pages/api/buyItem)
// - 학생 로그인: 본인만 구매
// - 교사 키오스크: 학생 비밀번호 확인 후 받은 kioskToken이 있어야 구매
export async function buyItem({ itemId, userId, classId, kioskToken }) {
  try {
    if (!itemId) {
      return { result: false, message: "잘못된 요청입니다." };
    }

    const session = await getServerSession(authOptions);

    let target;
    try {
      target = resolveStudentTarget(session, { userId, classId, kioskToken });
    } catch (error) {
      if (error instanceof StudentTargetError) return { result: false, message: error.message };
      throw error;
    }

    const { itemId: purchasedItemId } = await buyItemService({ ...target, itemId });

    return { result: true, message: "구매 완료", itemId: purchasedItemId };
  } catch (error) {
    if (!error?.status || error.status >= 500) console.error("buyItem action error:", error);
    return { result: false, message: error?.message || "구매 처리 중 오류가 발생했습니다." };
  }
}
