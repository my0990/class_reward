import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import crypto from "crypto";

// 🔒 send-code에서 쓴 것과 동일해야 함
const EMAIL_CODE_HMAC_KEY = process.env.EMAIL_CODE_HMAC_KEY;

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function hashCode(code) {
  if (!EMAIL_CODE_HMAC_KEY) throw new Error("EMAIL_CODE_HMAC_KEY missing");
  return crypto
    .createHmac("sha256", EMAIL_CODE_HMAC_KEY)
    .update(code)
    .digest("hex");
}

export async function POST(req) {
  try {
    const { email, code } = await req.json();

    const e = normalizeEmail(email);
    const c = String(code ?? "").trim();

    // ✅ 기본 검증
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return NextResponse.json(
        { success: false, message: "이메일 형식이 올바르지 않습니다" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(c)) {
      return NextResponse.json(
        { success: false, message: "인증 코드는 6자리 숫자입니다" },
        { status: 400 }
      );
    }

    const client = await connectDB;
    const db = client.db("user");

    const doc = await db
      .collection("email_verifications")
      .findOne({ email: e });

    if (!doc) {
      return NextResponse.json(
        { success: false, message: "인증 요청이 없습니다. 코드를 다시 받으세요." },
        { status: 400 }
      );
    }

    // ⏰ 만료 체크
    if (doc.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: "인증 코드가 만료되었습니다" },
        { status: 400 }
      );
    }

    // 🚫 시도 횟수 초과
    if ((doc.attemptsLeft ?? 0) <= 0) {
      return NextResponse.json(
        { success: false, message: "시도 횟수를 초과했습니다. 코드를 다시 받으세요." },
        { status: 429 }
      );
    }

    // 🔑 코드 비교 (해시)
    const inputHash = hashCode(c);
    if (inputHash !== doc.codeHash) {
      await db.collection("email_verifications").updateOne(
        { email: e },
        { $inc: { attemptsLeft: -1 } }
      );

      return NextResponse.json(
        { success: false, message: "인증 코드가 올바르지 않습니다" },
        { status: 400 }
      );
    }

    // ✅ 인증 성공
    await db.collection("email_verifications").updateOne(
      { email: e },
      {
        $set: {
          verifiedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "이메일 인증 완료",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "인증 처리 중 오류 발생" },
      { status: 500 }
    );
  }
}