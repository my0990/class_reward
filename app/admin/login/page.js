import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/auth/actionAuth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata = { title: "관리자 로그인", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await getAdminEmail()) redirect("/admin");
  return <AdminLoginForm />;
}
