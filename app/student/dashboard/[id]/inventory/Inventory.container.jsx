'use client';

import { useFetchData } from "@/hooks/useFetchData";
import { useState, useEffect } from "react";
import { mutate } from "swr";
import { useParams } from "next/navigation";

const EMPTY_DETAIL = {
    itemName: null,
    itemPrice: null,
    itemId: null,
    emoji: null,
    itemExplanation: null,
    teacher: null,
};

export default function InventoryContainer() {
    const { data: userData, isLoading: isUserLoading, isError: isUserError, } = useFetchData('/api/user');
    const { id } = useParams();
    const [itemList, setItemList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [itemDetail, setItemDetail] = useState(EMPTY_DETAIL);

    useEffect(() => {
        if (!userData) return;

        const tmp = (userData.itemList ?? []).map((a) => ({
            ...a,
            checked: false,
        }));

        setItemList(tmp);

        // 현재 선택한 아이템이 사라졌으면 상세 초기화
        if (
            itemDetail.itemId &&
            !tmp.some((item) => item.itemId === itemDetail.itemId)
        ) {
            setItemDetail(EMPTY_DETAIL);
        }
    }, [userData]);

    const onItemClick = (item) => {
        if (!item?.itemId) return;

        setItemDetail({
            itemName: item.itemName,
            itemExplanation: item.itemExplanation,
            emoji: item.emoji,
            teacher: item.teacher,
            itemPrice: item.itemPrice,
            itemId: item.itemId,
        });
    };

    const onSubmit = async () => {
        if (isLoading || !itemDetail.itemId) return;

        setIsLoading(true);

        try {
            const res = await fetch("/api/useItem", {

                method: "POST",
                body: JSON.stringify({
                    itemName: itemDetail.itemName,
                    userId,
                    itemId: itemDetail.itemId,
                    balance: money,
                    classId: id
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (data.result === true) {
                mutate(
                    "/api/user",

                );

                alert(`${itemDetail.itemName} 아이템을 사용하였습니다`);
                setItemDetail(EMPTY_DETAIL);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isUserLoading) return <div>Loading data...</div>;
    if (isUserError) return <div>Error loading data</div>;

    const { userId, money } = userData;

    return (
        <div className="min-h-screen bg-[#f3e3c2] p-3 sm:p-4 md:p-6">
            <div className="mx-auto w-full max-w-[1200px]  rounded-[24px]  border-4 border-[#6b4f2a] bg-[#c89b63] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)] sm:p-4 md:p-5">
                {/* 상단 헤더 */}
                <div className="mb-4 flex flex-col gap-3 rounded-2xl border-2 border-[#5b4120] bg-[#7a552c] px-4 py-3 text-white shadow-inner sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-bold tracking-wide sm:text-2xl">🎒 창고</h1>
                    <div className="w-fit rounded-xl bg-[#5f4020] px-4 py-2 text-sm font-semibold sm:text-base">
                        보유 코인: {money}
                    </div>
                </div>

                {/* 본문 */}
                <div className="grid grid-cols-1 gap-4 lg:h-[568px] lg:grid-cols-[minmax(0,1.4fr)_360px]">
                    {/* 왼쪽 인벤토리 */}
                    <section className="rounded-2xl border-4  border-[#5e4322] bg-[#8b6034] p-3 shadow-inner sm:p-4">
                        <div className="mb-3 flex items-center  justify-between">
                            <h2 className="text-base font-bold text-white sm:text-lg">
                                아이템 보관함
                            </h2>
                            <span className="rounded-lg bg-[#6d4b25] px-3 py-1 text-xs text-orange-100 sm:text-sm">
                                {itemList.length}개
                            </span>
                        </div>

                        <div className="rounded-2xl  border-[#4e361b]  p-3 sm:p-4">
                            {itemList.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                                    {itemList.map((item, i) => {
                                        const isSelected = item.itemId === itemDetail.itemId;

                                        return (
                                            <button
                                                key={item.itemId ?? i}
                                                type="button"
                                                onClick={() => onItemClick(item)}
                                                className={`
                          relative aspect-square w-full rounded-xl border-2 text-3xl transition
                          sm:text-4xl
                          border-[#4c3418] bg-[#f4e6c8]
                          hover:-translate-y-1 hover:scale-[1.03] hover:bg-[#ffe7a8]
                          active:scale-100
                          ${isSelected ? "ring-4 ring-yellow-300 border-yellow-500 bg-[#fff1b8]" : ""}
                        `}
                                            >
                                                <div className="flex h-full w-full items-center justify-center">
                                                    {item.emoji}
                                                </div>

                                                <span className="absolute bottom-1 right-2 text-[10px] font-bold text-[#6b4f2a] sm:text-xs">
                                                    {i + 1}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl bg-[#8a6236] text-center text-orange-50">
                                    <div className="mb-3 text-5xl">📭</div>
                                    <p className="font-bold">보관 중인 아이템이 없습니다</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 오른쪽 상세창 */}
                    <aside className="rounded-2xl  flex flex-col justify-center border-4 border-[#5e4322] bg-[#8b6034] p-3 shadow-inner sm:p-4">
                        <h2 className="mb-3 text-base font-bold text-white sm:text-lg">
                            선택한 아이템
                        </h2>

                        {itemDetail.itemName ? (
                            <div className="flex  flex-col rounded-2xl border-2 border-[#4e361b] bg-[#f4e6c8] p-4 sm:p-5">
                                <div className="mb-4 flex flex-col items-center rounded-2xl border-2 border-[#d1b98d] bg-[#fff8e7] p-4 sm:p-5">
                                    <div className="mb-3 flex h-[96px] w-[96px] items-center justify-center rounded-2xl border-2 border-[#d3b16d] bg-[#fff0b3] text-5xl shadow-inner sm:h-[120px] sm:w-[120px] sm:text-6xl">
                                        {itemDetail.emoji}
                                    </div>

                                    <h3 className="text-center text-lg font-bold text-[#4d3519] sm:text-xl">
                                        {itemDetail.itemName}
                                    </h3>

                                    {itemDetail.itemPrice !== null && (
                                        <div className="mt-2 rounded-full bg-[#e6d1aa] px-3 py-1 text-sm font-semibold text-[#6a4a23]">
                                            가치: {itemDetail.itemPrice}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4 min-h-[120px] flex-1 rounded-xl border border-[#d1b98d] bg-[#fffaf0] p-4">
                                    <p className="mb-2 text-sm font-bold text-[#6a4a23]">설명</p>
                                    <p className="break-words text-sm leading-relaxed text-[#5a4323] sm:text-base">
                                        {itemDetail.itemExplanation || "설명이 없습니다."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={onSubmit}
                                    disabled={isLoading}
                                    className={`
                    mt-auto w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition sm:text-base
                    ${isLoading
                                            ? "cursor-not-allowed bg-gray-400"
                                            : "bg-[#d97706] hover:bg-[#b45309] active:scale-[0.99]"}
                  `}
                                >
                                    {isLoading ? "사용 중..." : "사용하기"}
                                </button>
                            </div>
                        ) : (
                            <div className="flex  min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#4e361b] bg-[#f4e6c8] p-6 text-center">
                                <div className="mb-4 text-5xl sm:text-6xl">📦</div>
                                <p className="text-lg font-bold text-[#5a3f1d]">
                                    아이템을 선택하세요
                                </p>
                                <p className="mt-2 text-sm text-[#7a5b34] sm:text-base">
                                    왼쪽 인벤토리에서 아이템을 누르면
                                    <br />
                                    여기에서 상세 정보를 볼 수 있습니다.
                                </p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}