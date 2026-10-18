"use server";

import { authorizeTeacherClass } from "@/lib/auth/actionAuth";
import { saveSeatSetupService, confirmSeatsService } from "@/server-action/service/seat/seat.service";

/** 교실 배치·조건 저장 */
export async function saveSeatSetup({ classId, layout, rules }) {
  try {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return { result: false, message: auth.message };
    const res = await saveSeatSetupService({ teacher_id: auth.teacher_id, classId, layout, rules });
    return res.ok ? { result: true, message: "저장했습니다.", data: { layout: res.layout, rules: res.rules } } : { result: false, message: res.message };
  } catch (error) {
    console.error("saveSeatSetup error:", error);
    return { result: false, message: "저장하지 못했습니다." };
  }
}

/** 섞은 자리 저장 (replace: 기록에 남기지 않고 지금 자리만 바꿈) */
export async function confirmSeats({ classId, assignment, replace = false }) {
  try {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return { result: false, message: auth.message };
    const res = await confirmSeatsService({ teacher_id: auth.teacher_id, classId, assignment, replace: replace === true });
    return res.ok ? { result: true, message: "새 자리를 저장했습니다." } : { result: false, message: res.message };
  } catch (error) {
    console.error("confirmSeats error:", error);
    return { result: false, message: "자리를 저장하지 못했습니다." };
  }
}
