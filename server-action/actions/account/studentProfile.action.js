"use server";
// 선생님: 학생 관리에서 학생 별명·자기소개 고치기
import { logError } from "@/lib/errorLog/errorLog";
import { authorizeTeacherClass } from "@/lib/auth/actionAuth";
import { updateStudentProfileByTeacherService } from "@/server-action/service/account/studentProfile.service";

export async function updateStudentProfileByTeacher({ classId, userId, profileNickname, profileState }) {
  const auth = await authorizeTeacherClass(classId);
  if (!auth.ok) return { result: false, message: auth.message };
  try {
    const res = await updateStudentProfileByTeacherService({ teacher_id: auth.teacher_id, classId, userId, profileNickname, profileState });
    return res.ok ? { result: true, message: "수정했어요.", data: res.data } : { result: false, message: res.message };
  } catch (error) {
    logError("updateStudentProfileByTeacher error:", error);
    return { result: false, message: "수정하지 못했어요." };
  }
}
