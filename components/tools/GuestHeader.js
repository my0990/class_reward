// 비회원 도구(/tools/...) 위쪽: 뀰 로고 · 도구 메뉴 · 로그인/가입
import Link from "next/link";

export const GUEST_TOOLS = [{ href: "/tools/timer", label: "타이머" }];

export default function GuestHeader() {
  return (
    <header className="border-b-2 bg-white">
      <div className="page-width flex items-center justify-between gap-4 py-[12px]">
        <div className="flex items-center gap-[3vw]">
          <Link href="/" className="text-[24px] font-extrabold text-orange-500" title="뀰 첫 화면">
            🍊 뀰
          </Link>
          <nav className="flex gap-4 text-[1.05rem] font-semibold text-gray-500">
            {GUEST_TOOLS.map((t) => (
              <Link key={t.href} href={t.href} className="hover:text-orange-500">
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/auth/login/teacher" className="btn btn-sm btn-ghost text-gray-600">
            로그인
          </Link>
          <Link href="/auth/signup" className="btn btn-sm border-0 bg-orange-500 text-white hover:bg-orange-600" title="가입하면 학급 화폐·퀘스트·자리 기록까지">
            무료로 가입하기
          </Link>
        </div>
      </div>
    </header>
  );
}
