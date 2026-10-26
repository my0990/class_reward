"use client";
// 데이터를 불러오지 못했을 때 공용 화면: 안내 + [다시 시도]
// onRetry가 없으면 페이지를 새로고침한다. compact는 머리말처럼 좁은 자리용 한 줄.
export default function LoadError({ onRetry, message = "데이터를 불러오지 못했어요.", compact = false }) {
  const retry = () => (onRetry ? onRetry() : window.location.reload());

  if (compact) {
    return (
      <div role="alert" className="flex items-center justify-center gap-2 py-2 text-sm text-gray-600">
        <span>{message}</span>
        <button type="button" onClick={retry} className="font-semibold text-orange-600 underline">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div role="alert" className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-[3rem] leading-none" aria-hidden="true">🍊💦</div>
      <p className="mt-3 text-lg font-bold text-gray-800">{message}</p>
      <p className="mt-1 text-sm text-gray-500">인터넷 연결을 확인하고 다시 시도해주세요.</p>
      <button type="button" onClick={retry} className="mt-5 rounded-full bg-orange-500 px-6 py-2.5 font-bold text-white hover:bg-orange-600">
        다시 시도
      </button>
    </div>
  );
}
