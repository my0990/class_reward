"use server";
// 키오스크 퀘스트: 퀘스트를 고르고, 다 한 학생들이 자기 카드를 눌러 완료 신청 (비밀번호 없음)
// 보상은 선생님이 승인 센터에서 승인할 때 지급되므로, 여기서는 '신청'만 만든다.
// 쓸 수 있는 곳: 그 반 선생님 로그인 기기, 또는 그 반에 연결된 키오스크 기기
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorizeTeacherClass } from "@/lib/auth/actionAuth";
import { isKioskOfClass } from "@/lib/auth/kioskSession";
import { findActiveKioskDeviceService } from "@/server-action/service/kiosk/kioskDevice.service";
import { createQuestRequestsService, listKioskQuestsService } from "@/server-action/service/request/request.service";

async function kioskContext(classId) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (user?.role === "teacher") {
    const auth = await authorizeTeacherClass(classId);
    return auth.ok ? { ok: true, teacher_id: auth.teacher_id } : { ok: false, message: auth.message };
  }
  if (isKioskOfClass(user, classId)) {
    if (!(await findActiveKioskDeviceService(user._id))) {
      return { ok: false, message: "이 기기의 키오스크 연결이 끊겼어요. 선생님께 말씀해 주세요." };
    }
    return { ok: true, teacher_id: user.teacher_id };
  }
  return { ok: false, message: "로그인이 필요합니다." };
}

export async function listKioskQuests({ classId }) {
  try {
    const ctx = await kioskContext(classId);
    if (!ctx.ok) return { result: false, message: ctx.message };
    const quests = await listKioskQuestsService({ teacherObjectId: ctx.teacher_id, classObjectId: classId });
    return { result: true, quests };
  } catch (error) {
    console.error("listKioskQuests error:", error);
    return { result: false, message: "퀘스트를 불러오지 못했어요." };
  }
}

export async function requestKioskQuest({ classId, questId, userIds }) {
  try {
    const ctx = await kioskContext(classId);
    if (!ctx.ok) return { result: false, message: ctx.message };
    const r = await createQuestRequestsService({ teacherObjectId: ctx.teacher_id, classObjectId: classId, questId, userIds });
    return { result: true, created: r.created.length, skipped: r.skipped.length };
  } catch (error) {
    return { result: false, message: error?.message || "신청하지 못했어요." };
  }
}
