import Link from "next/link";
import Footer from "@/components/ui/common/Footer";

export const metadata = { title: "페이지를 찾을 수 없어요" };

// 없는 주소로 들어왔을 때
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col bg-orange-100">
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="text-[5rem] leading-none" aria-hidden="true">🍊</div>
        <p className="mt-4 text-[3rem] font-black text-orange-500">404</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-800">페이지를 찾을 수 없어요</h1>
        <p className="mt-2 text-gray-600">주소가 바뀌었거나 없는 페이지예요. 주소를 다시 확인해 주세요.</p>
        <Link href="/" className="mt-8 rounded-full bg-orange-500 px-6 py-3 font-bold text-white transition hover:scale-105">
          처음 화면으로
        </Link>
      </div>
      <Footer className="border-orange-200" />
    </main>
  );
}
