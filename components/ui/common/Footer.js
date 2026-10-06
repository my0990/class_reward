import Link from "next/link";
import { SITE } from "@/config/siteInfo";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";

// 공통 푸터: 개인정보처리방침(굵게) · 카카오톡 문의 · 저작권 (이메일은 개인정보처리방침에만)
export default function Footer({ className = "" }) {
  return (
    <footer className={`border-t border-gray-200 py-5 text-[13px] text-gray-500 ${className}`}>
      {/* 안쪽 내용은 대시보드 카드와 같은 폭 (globals.css .page-width) */}
      <div className="page-width flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/privacy" prefetch={false} className="font-bold text-gray-700 hover:underline">
            개인정보처리방침
          </Link>
          {SITE.kakaoOpenChatUrl && (
            <a
              href={SITE.kakaoOpenChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              {/* 카카오 노란색 배경의 말풍선 아이콘 */}
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#FEE500]" aria-hidden="true">
                <ChatBubbleOvalLeftIcon className="h-3.5 w-3.5 text-[#191919]" />
              </span>
              카카오톡 문의하기
            </a>
          )}
        </nav>
        <p>© {new Date().getFullYear()} {SITE.name}</p>
      </div>
    </footer>
  );
}
