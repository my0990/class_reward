import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import {
  normalizeEmail,
  isValidEmailFormat,
  generateCode6,
  hashCode,
} from "@/lib/auth/email";

// import { normalizeEmail } from "@/lib/auth/email";
const FREE_DAILY_LIMIT = 100;   // Free: 100/day :contentReference[oaicite:2]{index=2}
const FREE_MONTHLY_LIMIT = 3000; // Free: 3000/mo :contentReference[oaicite:3]{index=3}

export async function POST(req) {
  try {
    const { email } = await req.json();
    const e = normalizeEmail(email);

    if (!isValidEmailFormat(e)) {
      return NextResponse.json(
        { success: false, message: "이메일 형식이 올바르지 않습니다" },
        { status: 400 }
      );
    }

    const client = await connectDB;
    const db = client.db("user");

    // 이미 가입된 선생님 이메일이면 차단
    const exists = await db.collection("users").findOne({ role: "teacher", email: e });
    if (exists) {
      return NextResponse.json(
        { success: false, message: "이미 가입된 이메일입니다" },
        { status: 409 }
      );
    }

    const code = generateCode6();
    const codeHash = hashCode(code);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10분

    await db.collection("email_verifications").updateOne(
      { email: e },
      { $set: { email: e, codeHash, expiresAt, attemptsLeft: 5, createdAt: now } },
      { upsert: true }
    );

    // ✅ Resend API 직접 호출 (헤더 읽기 위해)
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
        to: e,
        subject: "[서비스명] 이메일 인증 코드",
        text: `인증 코드: ${code}\n\n10분 내로 입력해주세요.`,
      }),
    });

    const body = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json(
        { success: false, message: body?.message ?? "메일 전송 실패", detail: body },
        { status: resp.status }
      );
    }

    // ✅ 사용량(used) 헤더 읽기: x-resend-daily-quota(무료만), x-resend-monthly-quota(전체) :contentReference[oaicite:4]{index=4}
    const dailyUsed = Number(resp.headers.get("x-resend-daily-quota") ?? 0);
    const monthlyUsed = Number(resp.headers.get("x-resend-monthly-quota") ?? 0);

    return NextResponse.json({
      success: true,
      message: "인증 코드를 전송했습니다",
      quota: {
        plan: "free",
        daily: {
          used: dailyUsed,
          limit: FREE_DAILY_LIMIT,
          remaining: Math.max(0, FREE_DAILY_LIMIT - dailyUsed),
        },
        monthly: {
          used: monthlyUsed,
          limit: FREE_MONTHLY_LIMIT,
          remaining: Math.max(0, FREE_MONTHLY_LIMIT - monthlyUsed),
        },
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "코드 전송 실패" },
      { status: 500 }
    );
  }
}