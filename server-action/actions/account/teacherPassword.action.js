"use server";
// 선생님 본인: 임시 비밀번호(관리자 발급)로 로그인한 뒤 새 비밀번호 정하기
import { logError } from "@/lib/errorLog/errorLog";
import { getTeacherId, NOT_TEACHER_MESSAGE } from "@/lib/auth/actionAuth";
import { changeTeacherTempPasswordService } from "@/server-action/service/account/teacherPassword.service";

export async function changeMyTempPassword({ newPassword }) {
  try {
    const teacher_id = await getTeacherId();
    if (!teacher_id) return { result: false, message: NOT_TEACHER_MESSAGE };
    const res = await changeTeacherTempPasswordService({ teacher_id, newPassword });
    return res.ok ? { result: true, message: "비밀번호를 바꿨습니다." } : { result: false, message: res.message };
  } catch (error) {
    logError("changeMyTempPassword error:", error);
    return { result: false, message: "비밀번호를 바꾸지 못했습니다. 다시 시도해주세요." };
  }
}
