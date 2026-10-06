import { NextResponse } from "next/server";
import { requestEmailCodeService } from "@/server-action/service/auth/emailCode.service";

import { sendMailWithResend, getClientIpFromHeaders } from "@/lib/mail/resend";

// 회원가입 인증 메일
const sendSignupCode = ({ to, code }) =>
  sendMailWithResend({
    to,
    subject: "[학급 화폐] 이메일 인증 코드",
    text: `인증 코드: ${code}\n\n10분 내로 입력해주세요.`,
  });

export async function POST(req) {
  try {
    const { email } = await req.json().catch(() => ({}));

    const result = await requestEmailCodeService({
      email,
      ip: getClientIpFromHeaders(req.headers),
      sendMail: sendSignupCode,
    });

    if (!result.success) {
      const headers = result.retryAfterSec ? { "Retry-After": String(result.retryAfterSec) } : undefined;
      return NextResponse.json(
        { error: result.message, retryAfterSec: result.retryAfterSec },
        { status: result.status, headers }
      );
    }

    return NextResponse.json({ message: "인증 코드를 전송했습니다" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "코드 전송 실패" }, { status: 500 });
  }
}
