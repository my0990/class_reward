// server-action/action/item/item.action.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createItemService, deleteItemService, updateItemService } from "@/server-action/service/market/market.service";

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

      const itemStock = Number(updatedItemStock);
      const itemPrice = Number(updatedItemPrice);

      if (!Number.isInteger(itemStock) || itemStock < 0) {
          return {
              result: false,
              message: "재고는 0 이상의 정수로 입력해 주세요.",
          };
      }

      if (!Number.isInteger(itemPrice) || itemPrice < 0) {
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