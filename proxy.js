import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;
  const role = token?.user?.role;

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
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*", "/admin/:path*", "/student/:path*"],
};
