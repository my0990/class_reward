import Link from "next/link";
import { SITE } from "@/config/siteInfo";

// 공통 푸터: 개인정보처리방침(굵게) · 카카오톡 문의 · 저작권 (이메일은 개인정보처리방침에만)
export default function Footer({ className = "" }) {
  return (
    <footer className={`border-t border-gray-200 px-4 py-5 text-[13px] text-gray-500 ${className}`}>
      <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/privacy" prefetch={false} className="font-bold text-gray-700 hover:underline">
            개인정보처리방침
          </Link>
          {SITE.kakaoOpenChatUrl && (
            <a href={SITE.kakaoOpenChatUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              카카오톡 문의하기
            </a>
          )}
        </nav>
        <p>© {new Date().getFullYear()} {SITE.name}</p>
      </div>
    </footer>
  );
}
