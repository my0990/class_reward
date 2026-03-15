import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // teacher 전용 페이지
  if (pathname.startsWith("/teacher")) {
    
    // 로그인 안했으면
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 학생이면 접근 차단
    if (token.user.role === "student") {
      console.log('moved')
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*"],
};