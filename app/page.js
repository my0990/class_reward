import AuthPage from "./components/auth/AuthPage";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {

    redirect("/directory/dashboard")
  }

  return (
    <main>
      {/* <AuthPage /> */}
      <div className="flex justify-center items-center flex-wrap bg-orange-200 h-[100vh] ">
        <Link href="/login/teacher">
          <div className=" bg-white text-center text-[2rem] cursor-pointer m-[16px] rounded-3xl py-[32px] px-[64px] transition-all hover:scale-110">
            <div>선생님 로그인</div>
            {/* <div className="text-[10rem]">🧑‍🏫</div> */}
          </div>
        </Link>
        <Link href="/login/student">
          <div className=" bg-white text-center text-[2rem] cursor-pointer m-[16px] rounded-3xl py-[32px]  px-[64px] transition-all hover:scale-110">
            <div>
              학생 로그인
            </div>
            {/* <div className="text-[10rem]">
              🧑‍🎓
            </div> */}
          </div>
        </Link>
      </div>
    </main>
  );
}
