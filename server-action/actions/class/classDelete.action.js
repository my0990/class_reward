"use server";

import { authorizeTeacherClass } from "@/lib/auth/actionAuth";
import { softDeleteClassService, restoreClassService } from "@/server-action/service/class/deleteClass.service";

/** 학급을 휴지통으로 (30일 뒤 영구 삭제). confirmName = 사용자가 입력한 학급 이름 */
export async function deleteClass({ classId, confirmName }) {
  try {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return { result: false, message: auth.message };

    const res = await softDeleteClassService({ teacher_id: auth.teacher_id, classId, confirmName });
    return { result: true, message: "학급을 삭제했습니다. 30일 안에는 '삭제된 학급'에서 복구할 수 있어요.", data: res };
  } catch (error) {
    console.error("deleteClass error:", error);
    return { result: false, message: error.message || "학급 삭제에 실패했습니다." };
  }
}

/** 휴지통에서 복구 */
export async function restoreClass({ classId }) {
  try {
    const auth = await authorizeTeacherClass(classId, { includeDeleted: true });
    if (!auth.ok) return { result: false, message: auth.message };

    await restoreClassService({ teacher_id: auth.teacher_id, classId });
    return { result: true, message: "학급을 복구했습니다." };
  } catch (error) {
    console.error("restoreClass error:", error);
    return { result: false, message: error.message || "학급 복구에 실패했습니다." };
  }
}
