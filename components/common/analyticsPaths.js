// 방문 통계를 켤 화면 (Analytics.js 설명 참고)
const under = (pathname, p) => pathname === p || pathname.startsWith(`${p}/`);
const ALLOWED = ["/teacher", "/auth/login/teacher", "/auth/signup", "/auth/reset-password"];

export function isAnalyticsAllowed(pathname = "") {
  if (under(pathname, "/teacher/kiosk")) return false;
  return ALLOWED.some((p) => under(pathname, p));
}
