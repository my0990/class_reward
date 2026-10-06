'use client'

import ThermometerObject from "@/components/thermometer/ThermometerObject";
import { useParams, useRouter } from "next/navigation";
import { useThermometerBoard } from "@/hooks/thermometer/useThermometerBoard";

// 학급 온도계 보기 (기부하기 버튼 → donate)
export default function ThermometerPage() {
    const route = useRouter();
    const params = useParams();
    const classId = params.id;

    const {
        thermometerData,
        isLoading,
        isError,
        requireCurrency,
        classDegree,
        ranking,
    } = useThermometerBoard(classId);

    if (isLoading) {
        return <div>불러오는 중...</div>;
    }

    if (isError) {
        return <div>데이터 로드 실패</div>;
    }

    return (
        <div className="flex justify-center ">
            <div className="w-full max-w-6xl rounded-[28px] border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.08)] md:p-8">

                {/* 헤더 */}
                <div className=" flex flex-col gap-4 border-b border-orange-100 pb-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex  cursor-pointer hover:scale-110 transition-all">

                        <div className="h-[64px] w-[24px] flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                        </div>

                        <div onClick={() => route.push(`/teacher/kiosk/${classId}`)} className="flex items-center justify-center text-[2rem]" >이전</div>

                    </div>
                    <div>
                        <div className="flex items-center">
                            <h1 className="text-3xl font-extrabold tracking-tight text-orange-600 md:text-4xl">
                                학급 온도계
                            </h1>

                        </div>

                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => route.push(`/teacher/kiosk/${classId}/thermometer/donate`)} className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600">
                            기부하기
                        </button>
                    </div>
                </div>

                {/* 본문 */}
                <div className="flex flex-col gap-6 xl:flex-row">

                    {/* 왼쪽: 온도계 */}
                    <div className="relative flex min-h-[420px] flex-1 items-center justify-center rounded-3xl bg-white/80 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]">
                        <div className="absolute top-4 right-4 w-[120px] h-[80px] border-[4px] rounded-xl bg-white shadow-sm border-orange-500 ">
                            {/* 좌상단 텍스트 */}
                            <span className="absolute top-2 left-3 text-[0.8rem] text-gray-400 font-semibold">
                                현재 온도
                            </span>

                            {/* 우하단 큰 숫자 */}
                            <span className="absolute bottom-2 right-3 text-[1.6rem] font-bold text-orange-600">
                                {classDegree.toFixed(2)}도
                            </span>
                        </div>
                        <div className="scale-90 sm:scale-95">
                            <ThermometerObject
                                reward={thermometerData.reward}
                                currentDegree={classDegree}
                            />

                        </div>
                    </div>

                    {/* 오른쪽: 정보 패널 */}
                    <div className="flex w-full flex-col gap-6 xl:w-[360px]">

                        {/* 상태 카드 */}
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">현재 상태</h2>

                            </div>
                            <div className="space-y-4">
                                {(() => {
                                    // reward 객체를 degree 기준으로 정렬
                                    const sortedRewards = Object.entries(thermometerData?.reward || {})
                                        .filter(([_, value]) => value?.trim()) // 빈 값 제거
                                        .map(([degree, text]) => ({
                                            degree: Number(degree),
                                            text,
                                        }))
                                        .sort((a, b) => a.degree - b.degree);

                                    // 현재 온도보다 큰 첫 번째 보상 찾기
                                    const nextReward = sortedRewards.find(
                                        (item) => item.degree > classDegree
                                    );

                                    // 없으면 최고 보상 달성
                                    if (!nextReward) {
                                        return (
                                            <div className="rounded-2xl bg-green-50 px-4 py-4">
                                                <div className="text-sm text-gray-500">현재 상태</div>
                                                <div className="mt-1 text-lg font-bold text-green-600">
                                                    모든 보상 달성 완료 🎉
                                                </div>
                                            </div>
                                        );
                                    }

                                    const remainDegree = nextReward.degree - classDegree;
                                    const remainCookie = remainDegree * requireCurrency;

                                    return (
                                        <>
                                            {/* 다음 보상 */}
                                            <div className="rounded-2xl bg-amber-50 px-4 py-3">
                                                <div className="text-sm text-gray-500">다음 보상</div>
                                                <div className="mt-1 text-lg font-bold text-gray-800">
                                                    {nextReward.text}
                                                </div>
                                            </div>

                                            {/* 다음 보상까지 */}
                                            <div className="rounded-2xl bg-orange-50 px-4 py-3">
                                                <div className="text-sm text-gray-500">다음 보상까지</div>
                                                <div className="mt-1 text-lg font-bold text-gray-800">
                                                    {remainDegree.toFixed(2)}도{" "}
                                                    <span className="text-gray-400">
                                                        ({remainCookie.toFixed(2)}쿠키)
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* 랭킹 카드 */}
                        <div className="h-[200px] overflow-y-auto rounded-2xl  bg-white">
                            <table className="w-full table-fixed">
                                <thead className="sticky top-0 z-10 bg-white">
                                    <tr>
                                        <th className="w-1/4 py-2 text-center">순위</th>
                                        <th className="w-1/2 py-2 text-center">이름</th>
                                        <th className="w-1/4 py-2 text-center">총 기부쿠키</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {ranking.length > 0 ? (
                                        ranking.map((item) => (
                                            <tr
                                                key={item.userId}
                                                className=" last:border-0"
                                            >
                                                <td className="py-2 text-center font-bold">
                                                    {item.rank === 1
                                                        ? "🥇"
                                                        : item.rank === 2
                                                            ? "🥈"
                                                            : item.rank === 3
                                                                ? "🥉"
                                                                : `${item.rank}위`}
                                                </td>

                                                <td className="py-2 text-center">
                                                    {item.userId}
                                                </td>

                                                <td className="py-2 text-center font-semibold text-orange-600">
                                                    {item.amount.toLocaleString()} 쿠키
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="py-8 text-center text-gray-400"
                                            >
                                                아직 기부자가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )

}
