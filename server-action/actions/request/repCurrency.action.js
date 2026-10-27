"use server";
// 학생 대표: 친구에게 화폐 지급·회수 신청 (선생님이 승인 센터에서 승인해야 반영)
// 학생 본인 로그인에서만 (키오스크·선생님 기기 아님). 대표인지는 매번 DB에서 다시 확인한다.
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logError } from "@/lib/errorLog/errorLog";
import { bumpFeature } from "@/lib/stats/featureUsage";
import {
  listRepClassmatesService,
  createCurrencyRequestService,
  listMyCurrencyRequestsService,
  cancelMyCurrencyRequestService,
} from "@/server-action/service/request/currencyRequest.service";

async function studentScope() {
  const user = (await getServerSession(authOptions))?.user;
  if (user?.role !== "student" || !user.userId || !user.classId || !user.teacher_id) return null;
  return { teacher_id: String(user.teacher_id), classId: String(user.classId), userId: String(user.userId) };
}

async function run(label, fn) {
  try {
    const me = await studentScope();
    if (!me) return { result: false, message: "학생 계정으로 로그인해야 해요." };
    const res = await fn(me);
    const { ok, message, ...data } = res;
    return { result: Boolean(ok), message: message ?? "", data };
  } catch (error) {
    logError(`${label} error:`, error);
    return { result: false, message: "처리하지 못했어요. 다시 시도해 주세요." };
  }
}

export async function listRepClassmates() {
  return run("listRepClassmates", (me) => listRepClassmatesService(me));
}

export async function createCurrencyRequest({ targetUserIds, amount, isSend, memo }) {
  return run("createCurrencyRequest", async (me) => {
    const res = await createCurrencyRequestService({ ...me, targetUserIds, amount, isSend: isSend === true, memo });
    if (res.ok) bumpFeature("rep_request", { classId: me.classId });
    return res;
  });
}

export async function listMyCurrencyRequests() {
  return run("listMyCurrencyRequests", (me) => listMyCurrencyRequestsService(me));
}

export async function cancelMyCurrencyRequest({ batchId }) {
  return run("cancelMyCurrencyRequest", (me) => cancelMyCurrencyRequestService({ ...me, batchId }));
}
