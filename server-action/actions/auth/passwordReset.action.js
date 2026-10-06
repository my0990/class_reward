"use server";
// 교사 비밀번호 찾기 (로그인 전 화면이라 세션 확인 없음 — 서비스에서 발송 제한·코드 횟수·통과권으로 막는다)
import { headers } from "next/headers";
import { sendMailWithResend, getClientIpFromHeaders } from "@/lib/mail/resend";
import {
  requestPasswordResetService,
  verifyPasswordResetCodeService,
  resetPasswordService,
} from "@/server-action/service/auth/passwordReset.service";

const sendResetCode = ({ to, code }) =>
  sendMailWithResend({
    to,
    subject: "[뀰] 비밀번호 재설정 인증 코드",
    text: `비밀번호 재설정 인증 코드: ${code}\n\n10분 내로 입력해주세요.\n본인이 요청하지 않았다면 이 메일은 무시하셔도 됩니다.`,
  });

const toResult = (res) => ({ result: Boolean(res.ok), message: res.message ?? "", data: res.resetToken ? { resetToken: res.resetToken } : undefined });

async function safe(fn) {
  try {
    return toResult(await fn());
  } catch (err) {
    console.error("[password reset]", err);
    return { result: false, message: "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }
}

export async function requestPasswordReset({ email }) {
  return safe(async () => {
    const ip = getClientIpFromHeaders(await headers());
    return requestPasswordResetService({ email, ip, sendMail: sendResetCode });
  });
}

export async function verifyPasswordResetCode({ email, code }) {
  return safe(() => verifyPasswordResetCodeService({ email, code }));
}

export async function resetPassword({ resetToken, newPassword }) {
  return safe(() => resetPasswordService({ resetToken, newPassword }));
}
