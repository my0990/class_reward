// lib/services/auth/teacherSignup.service.js
import { connectDB } from "@/lib/mongodb";
import { hash } from "bcryptjs";
import { normalizeEmail, isValidEmailFormat } from "@/lib/auth/email";

/**
 * teacher 회원가입 서비스
 * @param {{ email: string, password: string }}
 * @returns {Promise<{success: boolean, code?: string, message?: string, id?: string}>}
 */
export async function signupTeacherService({ email, password }) {
  const e = normalizeEmail(email);
  const pwd = String(password ?? "");

  if (!isValidEmailFormat(e)) {
    return { success: false, code: "INVALID_EMAIL", message: "이메일 형식이 올바르지 않습니다" };
  }

  if (!pwd || pwd.length < 8) {
    return { success: false, code: "WEAK_PASSWORD", message: "비밀번호는 8자 이상 입력해주세요" };
  }

  try {
    const client = await connectDB;
    const db = client.db("user");

    // ✅ 이메일 인증 필수
    const v = await db.collection("email_verifications").findOne({ email: e });
    if (!v?.verifiedAt) {
      return { success: false, code: "EMAIL_NOT_VERIFIED", message: "이메일 인증이 필요합니다" };
    }

    // ✅ 중복 가입 방지
    const exists = await db.collection("users").findOne({ role: "teacher", email: e });
    if (exists) {
      return { success: false, code: "EMAIL_EXISTS", message: "이미 가입된 이메일입니다" };
    }

    const now = new Date();
    const passwordHash = await hash(pwd, 12);

    const result = await db.collection("users").insertOne({
      role: "teacher",
      email: e,
      passwordHash,
      emailVerifiedAt: v.verifiedAt,
      createdAt: now,
      updatedAt: now,
    });
    const db2 = client.db('data');
    const result2 = await db.collection("user_data").insertOne({
      userId: e,
      money: 0,
      role: 'teacher',
      profileNickname: '',
      profileState: '',
      profileUrl: 'https://cdn.pixabay.com/photo/2014/03/25/15/23/tangerine-296654_1280.png',
      profileUrlObj: []
    })
    // (선택) 인증 기록 삭제 or 유지
    await db.collection("email_verifications").deleteOne({ email: e });

    return { success: true, message: "회원가입 완료", id: result.insertedId.toString() };
  } catch (err) {
    console.error(err);

    if (err?.code === 11000) {
      return { success: false, code: "DUPLICATE", message: "이미 가입된 정보입니다" };
    }

    return { success: false, code: "SERVER_ERROR", message: "회원가입 실패" };
  }
}