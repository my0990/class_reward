import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TeacherChangePasswordForm from "./TeacherChangePasswordForm";

export const metadata = { title: "새 비밀번호 정하기" };

// 관리자가 임시 비밀번호를 발급한 선생님 → 새 비밀번호 정하기 (proxy.js가 여기로 보낸다)
export default async function TeacherChangePasswordPage() {
  const user = (await getServerSession(authOptions))?.user;
  if (user?.role !== "teacher") redirect("/");
  if (!user.mustChangePassword) redirect("/teacher/classes");
  return <TeacherChangePasswordForm email={user.email ?? ""} />;
}
