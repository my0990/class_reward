"use server";
// 관리자 '계정 도우미' server action — 모두 관리자 세션(getAdminEmail)부터 확인한다.
import { getAdminEmail, NOT_ADMIN_MESSAGE } from "@/lib/auth/actionAuth";
import { logError } from "@/lib/errorLog/errorLog";
import {
  lookupTeacherAccountService,
  unlockTeacherLoginService,
  clearTeacherEmailLimitService,
  issueTeacherTempPasswordService,
  findTeacherByClassNicknameService,
} from "@/server-action/service/admin/teacherAccount.service";

async function run(fn) {
  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) return { result: false, message: NOT_ADMIN_MESSAGE };
    const res = await fn(adminEmail);
    const { ok, message, ...data } = res;
    return { result: Boolean(ok), message: message ?? "", data };
  } catch (err) {
    logError("[admin account]", err);
    return { result: false, message: "서버 오류가 발생했습니다." };
  }
}

export async function lookupTeacherAccountAction({ email }) {
  return run(() => lookupTeacherAccountService({ email }));
}

export async function unlockTeacherLoginAction({ email }) {
  return run((adminEmail) => unlockTeacherLoginService({ adminEmail, email }));
}

export async function clearTeacherEmailLimitAction({ email }) {
  return run((adminEmail) => clearTeacherEmailLimitService({ adminEmail, email }));
}

export async function issueTeacherTempPasswordAction({ email, confirmed }) {
  if (confirmed !== true) return { result: false, message: "본인 확인을 먼저 해주세요." };
  return run((adminEmail) => issueTeacherTempPasswordService({ adminEmail, email }));
}

export async function findTeacherByClassNicknameAction({ keyword }) {
  return run((adminEmail) => findTeacherByClassNicknameService({ adminEmail, keyword }));
}
