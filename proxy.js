import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isKioskUser, isKioskAllowedPath, kioskHomePath } from "@/lib/auth/kioskSession";

export async function proxy(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;
  const role = token?.user?.role;

  // 키오스크 기기: 자기 반 키오스크 화면만 (선생님·학생·관리자 화면으로 가면 키오스크로 되돌림)
  if (role === "kiosk") {
    const ok = isKioskUser(token.user) && !token.invalidUser; // invalidUser: 연결이 끊긴 기기
    if (ok && isKioskAllowedPath(token.user, pathname)) return NextResponse.next();
    return NextResponse.redirect(new URL(ok ? kioskHomePath(token.user) : "/", req.url));
  }

  // 관리자 페이지: 로그인 화면 말고는 관리자만
  // (최종 확인은 페이지/액션에서 ADMIN_EMAILS까지 다시 본다)
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // 학생: 기본 비밀번호 그대로면 새 비밀번호를 정할 때까지 다른 화면에 못 간다
  if (pathname.startsWith("/student")) {
    if (role === "student" && token?.user?.mustChangePassword && pathname !== "/student/change-password") {
      return NextResponse.redirect(new URL("/student/change-password", req.url));
    }
    return NextResponse.next();
  }

  // teacher 전용 페이지: 교사만 (학생·관리자는 차단)
  if (pathname.startsWith("/teacher")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (role !== "teacher") {
      return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/", req.url));
    }
    // 관리자가 임시 비밀번호를 발급한 계정: 새 비밀번호를 정할 때까지 다른 화면에 못 간다
    if (token.user?.mustChangePassword && pathname !== "/teacher/change-password") {
      return NextResponse.redirect(new URL("/teacher/change-password", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*", "/admin/:path*", "/student/:path*"],
};
