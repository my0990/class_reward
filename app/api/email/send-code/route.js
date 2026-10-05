import { NextResponse } from "next/server";
import { requestEmailCodeService } from "@/server-action/service/auth/emailCode.service";

// Resend API로 인증 메일 발송
async function sendMailWithResend({ to, code }) {
  const from = process.env.MAIL_FROM;
  const apiKey = process.env.RESEND_API_KEY;
  if (!from) throw new Error("MAIL_FROM missing");
  if (!apiKey) throw new Error("RESEND_API_KEY missing");

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "[학급 화폐] 이메일 인증 코드",
      text: `인증 코드: ${code}\n\n10분 내로 입력해주세요.`,
    }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    console.error("[send-code] Resend error", resp.status, body);
    return { ok: false };
  }
  return { ok: true };
}

// Vercel 등 프록시 뒤에서는 실제 접속 IP가 x-forwarded-for 첫 번째 값에 들어온다.
function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || null;
  return req.headers.get("x-real-ip") || null;
}

export async function POST(req) {
  try {
    const { email } = await req.json().catch(() => ({}));

    const result = await requestEmailCodeService({
      email,
      ip: getClientIp(req),
      sendMail: sendMailWithResend,
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
