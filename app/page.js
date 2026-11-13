import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/ui/common/Footer";
import KkyulHello from "@/components/common/KkyulHello";
export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session && session.user.role === "teacher") {
    redirect("/teacher/classes")
  } else if (session && session.user.role === "student") {
    redirect(`/student/dashboard/${session.user.classId}`)
  } else if (session && session.user.role === "admin") {
    redirect("/admin")
  } else if (session && session.user.role === "kiosk") {
    redirect(`/teacher/kiosk/${session.user.classId}`) // 키오스크로 연결된 기기
  }
    

  return (
    // 첫 화면: 왼쪽 소개 · 오른쪽 로그인 카드 (휴대폰에서는 로그인 카드가 위)
    <main className="flex min-h-dvh flex-col bg-orange-200">
      <header className="flex items-center justify-between px-6 py-5 sm:px-12">
        <span className="text-[28px] font-black text-orange-600">🍊 뀰</span>
        <span className="text-sm text-orange-900/80">무료 · 학급 운영 서비스</span>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 pb-10 sm:px-12 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        {/* 소개 */}
        <section className="order-2 lg:order-1">
          <h1 className="text-[clamp(2rem,4.5vw,2.9rem)] font-black leading-snug text-gray-800">
            칭찬은 <span className="text-orange-600">화폐</span>로,
            <br />
            습관은 <span className="text-orange-600">퀘스트</span>로.
          </h1>
          <p className="mt-4 text-[1.1rem] leading-8 text-stone-600">
            우리 반 학급 화폐·퀘스트·상점을 한곳에서.
            <br />
            타이머·자리 바꾸기 같은 수업 도구도 함께 써요.
          </p>
          <ul className="mt-7 flex flex-wrap gap-2.5">
            {["🍪 학급 화폐", "📜 퀘스트", "🏪 상점", "🖥️ 키오스크", "⏱️ 수업 도구"].map((t) => (
              <li key={t} className="rounded-full border border-orange-300 bg-orange-50 px-3.5 py-1.5 text-[15px] font-semibold text-gray-700">
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* 로그인 (애니메이션을 바꾸면 ?v= 숫자를 올려 브라우저에 남은 예전 파일을 쓰지 않게) */}
        <section className="order-1 flex flex-col items-center gap-5 rounded-[32px] bg-white px-7 pb-7 pt-8 shadow-[0_20px_40px_rgba(234,88,12,0.15)] sm:px-9 sm:pb-8 sm:pt-10 lg:order-2">
          <KkyulHello size={280} className="-my-3" src="/kkyul-roll.json?v=2" />
          <Link
            href="/auth/login/teacher"
            className="flex h-[96px] w-full items-center justify-center gap-3 rounded-3xl bg-orange-500 text-[1.7rem] font-extrabold text-white transition hover:bg-orange-600 active:scale-[0.98]"
          >
            선생님 로그인
          </Link>
          <Link
            href="/auth/login/student"
            className="flex h-[96px] w-full items-center justify-center gap-3 rounded-3xl border-[3px] border-orange-500 bg-white text-[1.7rem] font-extrabold text-orange-600 transition hover:bg-orange-50 active:scale-[0.98]"
          >
            학생 로그인
          </Link>
          {/* 가입 없이 쓰는 도구 (/tools) */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[15px] text-orange-900">
            <span>가입 없이 써 보기</span>
            <Link href="/tools/timer" className="font-bold hover:underline">
              ⏱️ 타이머
            </Link>
            <Link href="/tools/seat" className="font-bold hover:underline">
              🪑 자리 바꾸기
            </Link>
          </div>
        </section>
      </div>

      <Footer className="border-orange-300 text-gray-600" />
    </main>
  );
}
