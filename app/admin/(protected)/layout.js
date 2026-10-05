import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/auth/actionAuth";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";

export const metadata = { title: "관리자", robots: { index: false } };
export const dynamic = "force-dynamic";

// /admin 아래 모든 페이지(로그인 제외)는 여기서 관리자인지 확인한다. (페이지에서도 한 번 더: requireAdminPage)
export default async function AdminLayout({ children }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) redirect("/admin/login");

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="font-bold">뀰 관리자</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="hover:underline">대시보드</Link>
            <Link href="/admin/notices" className="hover:underline">공지사항</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-500">
            <span className="hidden sm:inline">{adminEmail}</span>
            <AdminSignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
