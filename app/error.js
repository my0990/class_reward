"use client";
// 화면을 그리다 오류가 났을 때 (전체가 하얗게 멈추지 않도록)
import Link from "next/link";

export default function ErrorBoundary({ error, reset }) {
  console.error(error);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-orange-100 px-6 text-center">
      <div className="text-[4rem] leading-none" aria-hidden="true">🍊💦</div>
      <h1 className="mt-4 text-2xl font-bold text-gray-800">잠시 문제가 생겼어요</h1>
      <p className="mt-2 text-gray-600">다시 시도해도 계속되면 화면 아래 &apos;카카오톡 문의하기&apos;로 알려주세요.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={() => reset()} className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white">
          다시 시도
        </button>
        <Link href="/" className="rounded-full bg-white px-6 py-3 font-bold text-orange-600">
          처음 화면으로
        </Link>
      </div>
    </main>
  );
}
