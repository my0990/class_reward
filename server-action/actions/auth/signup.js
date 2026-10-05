// app/actions/teacherSignup.action.js
"use server";

// import { signupTeacherService } from "@/lib/services/auth/teacherSignup.service";
import { signupTeacherService } from "@/server-action/service/auth/signupService";
/**
 * 클라이언트에서 직접 호출하는 서버액션
 * @param {{ email: string, password: string }}
 */
export async function teacherSignupAction({ email, password }) {
  // 여기서 UI 검증을 한번 더 해도 되고(선택),
  // 핵심 검증/DB는 service가 책임
  // 서비스는 { success, code, message }를 준다 → action 공통 형식 { result, message, code }로
  const res = await signupTeacherService({ email, password });
  return { result: Boolean(res.success), message: res.message, code: res.code };
}