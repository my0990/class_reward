// Resend API로 메일 보내기 (회원가입 인증, 비밀번호 찾기 공용)
export async function sendMailWithResend({ to, subject, text }) {
  const from = process.env.MAIL_FROM;
  const apiKey = process.env.RESEND_API_KEY;
  if (!from) throw new Error("MAIL_FROM missing");
  if (!apiKey) throw new Error("RESEND_API_KEY missing");

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    console.error("[mail] Resend error", resp.status, body);
    return { ok: false };
  }
  return { ok: true };
}

/** Vercel 등 프록시 뒤에서는 실제 접속 IP가 x-forwarded-for 첫 번째 값에 들어온다. */
export function getClientIpFromHeaders(headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || null;
  return headers.get("x-real-ip") || null;
}
