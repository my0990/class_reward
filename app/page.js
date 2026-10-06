import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/ui/common/Footer";
export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session && session.user.role === "teacher") {
    redirect("/teacher/classes")
  } else if (session && session.user.role === "student") {
    redirect(`/student/dashboard/${session.user.classId}`)
  } else if (session && session.user.role === "admin") {
    redirect("/admin")
  }
    

  return (
    <main className="flex min-h-dvh flex-col bg-orange-200">
      <div className="flex flex-1 justify-center items-center flex-wrap">
        <div>
          <Link href="/auth/login/teacher">
            <div className=" bg-white text-center text-[2rem] cursor-pointer m-[16px] rounded-3xl py-[32px] px-[64px] transition-all hover:scale-110">
              <div>선생님 로그인</div>
            </div>
          </Link>
          <Link href="/auth/login/student">
            <div className=" bg-white text-center text-[2rem] cursor-pointer m-[16px] rounded-3xl py-[32px]  px-[64px] transition-all hover:scale-110">
              <div>
                학생 로그인
              </div>
            </div>
          </Link>
        </div>
      </div>
      <Footer className="border-orange-300 text-gray-600" />
    </main>
  );
}
