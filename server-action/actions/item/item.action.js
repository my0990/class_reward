"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { resolveStudentTarget, StudentTargetError } from "@/lib/auth/studentTarget";
import { useItemService } from "@/server-action/service/item/item.service";

// 이 액션은 두 경로에서 호출된다.
//  1) 학생이 자기 계정으로 로그인해서 직접 인벤토리에서 사용 (student dashboard inventory)
//  2) 교사 키오스크에서 학생이 비밀번호를 확인한 뒤 사용 → kioskToken 필요
// 누구의 아이템인지는 resolveStudentTarget(lib/auth/studentTarget)이 정한다.
export async function useItem({ userId, itemId, itemName, classId, kioskToken }) {
  try {
    const session = await getServerSession(authOptions);

    let target;
    try {
      target = resolveStudentTarget(session, { userId, classId, kioskToken });
    } catch (error) {
      if (error instanceof StudentTargetError) return { result: false, message: error.message };
      throw error;
    }

    const teacher_id = target.teacher_id;
    const targetUserId = target.userId;
    const targetClassId = target.classId;

    return await useItemService({
      teacher_id,
      classId: targetClassId,
      userId: targetUserId,
      itemId,
      itemName,
    });
  } catch (error) {
    console.error("useItem error:", error);

    return {
      result: false,
      message: error.message || "아이템 사용에 실패했습니다.",
    };
  }
}
