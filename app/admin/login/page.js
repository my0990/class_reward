import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAdminEmail } from "@/lib/auth/actionAuth";
import { isAdminEmail } from "@/lib/auth/adminAuth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminModeForm from "@/components/admin/AdminModeForm";

export const metadata = { title: "관리자 로그인", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminEmail()) redirect("/admin");
  // 관리자 이메일로 선생님 로그인 중이면: 이메일 입력 없이 관리자 비밀번호만 (관리자 모드)
  const user = (await getServerSession(authOptions))?.user;
  if (user?.role === "teacher" && isAdminEmail(user.email)) return <AdminModeForm email={user.email} />;
  return <AdminLoginForm />;
}
