import { NextResponse } from "next/server";
import { withApiHandler, ApiError } from "@/lib/api/routeHelpers";
import { verifyEmailCodeService } from "@/server-action/service/auth/emailCode.service";

// 회원가입 이메일 인증 코드 확인 (규칙과 테스트는 emailCode.service.js)
export const POST = withApiHandler(async (req) => {
  const { email, code } = await req.json().catch(() => ({}));
  const result = await verifyEmailCodeService({ email, code });
  if (!result.success) throw new ApiError(result.status, result.message);
  return NextResponse.json({ message: "이메일 인증 완료" });
});
