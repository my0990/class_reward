"use server";

import { authorizeTeacherClass } from "@/lib/auth/actionAuth";
import { renameClassService } from "@/server-action/service/class/renameClass.service";

/** 학급 이름 바꾸기 */
export async function renameClass({ classId, className }) {
  try {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return { result: false, message: auth.message };

    const res = await renameClassService({ teacher_id: auth.teacher_id, classId, className });
    if (!res.ok) return { result: false, message: res.message };
    return { result: true, message: "학급 이름을 바꿨습니다.", data: { className: res.className } };
  } catch (error) {
    console.error("renameClass error:", error);
    return { result: false, message: "학급 이름 변경에 실패했습니다." };
  }
}
