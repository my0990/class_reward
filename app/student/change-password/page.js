import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ChangePasswordForm from "./ChangePasswordForm";

// 학생 첫 로그인(기본 비밀번호) → 새 비밀번호 정하기 (proxy.js가 여기로 보낸다)
export default async function StudentChangePasswordPage() {
  const user = (await getServerSession(authOptions))?.user;
  if (user?.role !== "student") redirect("/");
  if (!user.mustChangePassword) redirect(`/student/dashboard/${user.classId}`);
  return <ChangePasswordForm user={{ userId: user.userId, classId: String(user.classId) }} />;
}
