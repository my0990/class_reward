"use client";

import ModalTemplate from "@/components/ui/common/ModalTemplate";
import { useEffect, useMemo, useState } from "react";

// 항상 보여줄 기본 구조


export default function SettingModal({
    modalId,
    setModalId,
    rewardObj,
    onRewardInputChange,
    requireCurrency,
    onUpdateTemperatureSetting,
    setRequireCurrency
}) {


    // 정렬
    const sortedRewards = useMemo(() => {
        return Object.entries(rewardObj).sort(
            (a, b) => Number(a[0]) - Number(b[0])
        );
    }, [rewardObj]);

    const leftRewards = sortedRewards.filter(([degree]) => Number(degree) <= 50);
    const rightRewards = sortedRewards.filter(([degree]) => Number(degree) > 50);

    return (
        <ModalTemplate id="HANDLE_SETTING" modalId={modalId} setModalId={setModalId}>
            {({ close }) => {
                return (
                    <div className="w-[760px] max-w-full rounded-2xl bg-white shadow-xl">
                        <div className="p-6 space-y-8">
                            {/* 온도별 보상 */}
                            <div>
                                <div className="mb-4">
                                    <div className="font-semibold text-[1rem]">온도별 보상</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        50도까지는 왼쪽, 그 이후는 오른쪽에 배치됩니다
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* 왼쪽 */}
                                    <div className="rounded-xl border bg-orange-50/50 p-4">
                                        <div className="space-y-2">
                                            {leftRewards.map(([degree, reward]) => (
                                                <div key={degree} className="flex items-center gap-2">
                                                    <div className="w-[60px] text-sm font-semibold text-orange-500">
                                                        {degree}도
                                                    </div>

                                                    <input
                                                        value={reward}
                                                        onChange={(e) =>
                                                            onRewardInputChange(degree, e.target.value)
                                                        }
                                                        className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-orange-400"
                                                        placeholder="보상 입력"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 오른쪽 */}
                                    <div className="rounded-xl border bg-orange-50/50 p-4">
                                        <div className="space-y-2">
                                            {rightRewards.map(([degree, reward]) => (
                                                <div key={degree} className="flex items-center gap-2">
                                                    <div className="w-[60px] text-sm font-semibold text-orange-500">
                                                        {degree}도
                                                    </div>

                                                    <input
                                                        value={reward}
                                                        onChange={(e) =>
                                                            onRewardInputChange(degree, e.target.value)
                                                        }
                                                        className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-orange-400"
                                                        placeholder="보상 입력"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 쿠키 설정 */}
                            <div>
                                <div className="font-semibold mb-3">1도 상승 조건</div>

                                <div className="border rounded-xl p-5 bg-orange-50">
                                    <div className="text-sm text-gray-500 mb-2">
                                        필요한 쿠키
                                    </div>

                                    <div className="relative max-w-[240px]">
                                        <input
                                            type="number"
                                            value={requireCurrency}
                                            onChange={(e) => setRequireCurrency(e.target.value)}
                                            className="w-full h-[48px] text-xl font-bold border rounded-xl px-3 pr-12 bg-white focus:outline-none focus:border-orange-400"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 font-semibold text-sm">
                                            쿠키
                                        </span>
                                    </div>

                                    <div className="mt-4 text-sm text-gray-600">
                                        쿠키{" "}
                                        <span className="font-bold text-orange-500">
                                            {requireCurrency || 0}개
                                        </span>
                                        마다 온도가{" "}
                                        <span className="font-bold text-red-500">1도</span>
                                        올라갑니다
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 하단 */}
                        <div className="flex justify-end gap-2 border-t px-6 py-4">
                            <button
                                onClick={close}
                                className="px-4 py-2 rounded-lg border text-sm"
                            >
                                취소
                            </button>

                            <button
                                onClick={onUpdateTemperatureSetting}
                                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                );
            }}
        </ModalTemplate>
    );
}