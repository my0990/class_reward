"use server";
// 승인 센터 (지금은 선생님만. 학생 관리자는 2단계에서 actor만 바꿔 같은 서비스를 쓴다)
import { authorizeTeacherClass } from "@/lib/auth/actionAuth";
import {
  listRequestsService,
  decideRequestsService,
  countPendingRequestsService,
} from "@/server-action/service/request/request.service";

export async function listRequests({ classId, status = "pending" }) {
  const auth = await authorizeTeacherClass(classId);
  if (!auth.ok) return { result: false, message: auth.message };
  try {
    const rows = await listRequestsService({
      teacherObjectId: auth.teacher_id,
      classObjectId: classId,
      status: status === "done" ? "done" : "pending",
    });
    return { result: true, rows };
  } catch (error) {
    console.error("listRequests error:", error);
    return { result: false, message: "요청 목록을 불러오지 못했어요." };
  }
}

export async function decideRequests({ classId, requestIds, decision, reason }) {
  const auth = await authorizeTeacherClass(classId);
  if (!auth.ok) return { result: false, message: auth.message };
  try {
    const summary = await decideRequestsService({
      actor: { role: "teacher", teacherId: auth.teacher_id, label: "선생님" },
      teacherObjectId: auth.teacher_id,
      classObjectId: classId,
      requestIds,
      decision,
      reason,
    });
    return { result: true, summary };
  } catch (error) {
    return { result: false, message: error?.message || "처리하지 못했어요." };
  }
}

export async function countPendingRequests({ classId }) {
  const auth = await authorizeTeacherClass(classId);
  if (!auth.ok) return { result: false, count: 0 };
  try {
    return { result: true, count: await countPendingRequestsService({ teacherObjectId: auth.teacher_id, classObjectId: classId }) };
  } catch {
    return { result: false, count: 0 };
  }
}
