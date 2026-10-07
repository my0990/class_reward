"use client";
// 선생님 대시보드 푸터: 도구 화면(/tools/...)에서는 숨긴다 (번호 뽑기 등은 화면을 넓게 쓰기 위해)
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function DashboardFooter() {
  const pathname = usePathname() ?? "";
  if (/\/teacher\/dashboard\/[^/]+\/tools(\/|$)/.test(pathname)) return null;
  return <Footer />;
}
