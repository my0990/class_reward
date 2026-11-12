"use server";
// 관리자 모드 켜기·끄기 (선생님 로그인 그대로 + 관리자 권한 12시간) — lib/auth/adminAuth의 isAdminModeActive
// 여기서는 비밀번호만 확인하고 서명 토큰을 돌려준다.
// 화면에서 그 토큰으로 signIn("credentials", { role: "admin-mode" })을 부르면 세션(JWT)에 반영된다.
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { authorizeAdmin, isAdminEmail, AdminLockedError, ADMIN_MODE_PURPOSE } from "@/lib/auth/adminAuth";
import { createSignedToken } from "@/lib/auth/signedToken";

const TOKEN_MS = 2 * 60 * 1000;

async function teacherUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  return user?.role === "teacher" && typeof user._id === "string" ? user : null;
}

/** 관리자 비밀번호 확인 → 관리자 모드 켜는 토큰 (5번 틀리면 15분 잠금, 관리자 로그인과 같은 규칙) */
export async function enableAdminMode({ password } = {}) {
  const user = await teacherUser();
  if (!user || !isAdminEmail(user.email)) return { result: false, message: "관리자 권한이 없는 계정입니다." };
  try {
    const admin = await authorizeAdmin((await connectDB).db("admins"), { email: user.email, password });
    if (!admin) return { result: false, message: "관리자 비밀번호가 맞지 않아요." };
  } catch (err) {
    if (err instanceof AdminLockedError) return { result: false, message: err.message };
    return { result: false, message: "확인하지 못했어요. 잠시 뒤 다시 시도해 주세요." };
  }
  return { result: true, token: createSignedToken(ADMIN_MODE_PURPOSE, { t: user._id, on: 1 }, { ttlMs: TOKEN_MS }) };
}

/** 관리자 모드 끄기 → 선생님 로그인만 남기는 토큰 */
export async function disableAdminMode() {
  const user = await teacherUser();
  if (!user) return { result: false, message: "선생님 계정으로 로그인해야 합니다." };
  return { result: true, token: createSignedToken(ADMIN_MODE_PURPOSE, { t: user._id, on: 0 }, { ttlMs: TOKEN_MS }) };
}
