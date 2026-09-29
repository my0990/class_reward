"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { useItemService } from "@/server-action/service/item/item.service";

// 이 액션은 두 경로에서 호출된다.
//  1) 학생이 자기 계정으로 로그인해서 직접 인벤토리에서 사용 (student dashboard inventory)
//     → userId/classId/teacher_id를 세션 값만 신뢰한다.
//  2) 교사가 kiosk 기기에 로그인한 상태로 특정 학생을 대신 사용 처리
//     (teacher/kiosk 사용/구매 흐름) → 이 기기엔 학생 개별 로그인 세션이 없으므로
//     세션은 교사이고, userId/classId는 파라미터로 받는다. teacher_id는 반드시
//     세션(로그인된 교사) 값만 쓰고, service에서 teacher_id+classId로 다시 스코핑한다.
export async function useItem({ userId, itemId, itemName, classId }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { result: false, message: "로그인이 필요합니다." };
    }

    let teacher_id;
    let targetUserId;
    let targetClassId;

    if (session.user.role === "student" && session.user.userId && session.user.classId && session.user.teacher_id) {
      teacher_id = session.user.teacher_id;
      targetUserId = session.user.userId;
      targetClassId = session.user.classId;
    } else if (session.user.role === "teacher" && session.user.teacher_id) {
      teacher_id = session.user.teacher_id;
      targetUserId = userId;
      targetClassId = classId;
    } else {
      return { result: false, message: "로그인이 필요합니다." };
    }

    if (!targetUserId || !targetClassId) {
      return { result: false, message: "잘못된 요청입니다." };
    }

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
