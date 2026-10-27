"use server";
// 선생님: 학생 대표 지정·해제 (대표는 친구에게 화폐 지급·회수를 '신청'할 수 있다 → 승인 센터)
import { logError } from "@/lib/errorLog/errorLog";
import { authorizeTeacherClass } from "@/lib/auth/actionAuth";
import { setRepresentativeService } from "@/server-action/service/request/currencyRequest.service";

export async function setRepresentative({ classId, userId, on }) {
  const auth = await authorizeTeacherClass(classId);
  if (!auth.ok) return { result: false, message: auth.message };
  try {
    const res = await setRepresentativeService({ teacher_id: auth.teacher_id, classId, userId, on: on === true });
    if (!res.ok) return { result: false, message: res.message };
    return {
      result: true,
      message: on === true ? "대표로 지정했어요." : `대표를 해제했어요.${res.canceled ? ` 기다리던 신청 ${res.canceled}건은 취소했어요.` : ""}`,
    };
  } catch (error) {
    logError("setRepresentative error:", error);
    return { result: false, message: "처리하지 못했어요." };
  }
}
