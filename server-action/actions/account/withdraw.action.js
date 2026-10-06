"use server";

import { getTeacherId, NOT_TEACHER_MESSAGE } from "@/lib/auth/actionAuth";
import {
  getWithdrawSummaryService,
  withdrawTeacherService,
} from "@/server-action/service/account/withdraw.service";

/** 탈퇴 확인 창에 보여줄 학급·학생 수 */
export async function getWithdrawSummary() {
  try {
    const teacher_id = await getTeacherId();
    if (!teacher_id) return { result: false, message: NOT_TEACHER_MESSAGE };
    return { result: true, data: await getWithdrawSummaryService({ teacher_id }) };
  } catch (error) {
    console.error("getWithdrawSummary error:", error);
    return { result: false, message: "정보를 불러오지 못했습니다." };
  }
}

/** 교사 회원 탈퇴 (즉시 영구 삭제) */
export async function withdrawTeacher({ password, confirmText }) {
  try {
    const teacher_id = await getTeacherId();
    if (!teacher_id) return { result: false, message: NOT_TEACHER_MESSAGE };

    const res = await withdrawTeacherService({ teacher_id, password, confirmText });
    if (!res.ok) return { result: false, message: res.message };
    return { result: true, message: "탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다." };
  } catch (error) {
    console.error("withdrawTeacher error:", error);
    return { result: false, message: "탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요." };
  }
}
