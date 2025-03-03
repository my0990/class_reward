
import ItemBuyCard from "./ItemBuyCard";
import { useState } from "react";
import { fetchData } from "@/hooks/swrHooks";
import Link from "next/link";

export default function ItemPickTemplate({ setRequestData }) {

    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = fetchData('/api/fetchClassData');


    const onClick = (a) => {
        if (a.itemStock > 0) {
            setRequestData((prev) => ({ ...prev, step: "buyCharacterPick", itemData: a }))
        }
    }


    if (isClassDataLoading) return <div>Loading data...</div>;
    if (isClassDataError) return <div>Error loading data</div>;
    const { itemList, currencyEmoji, currencyName } = classData;
    return (
        <div className="flex flex-col  items-center relative  bg-orange-100 min-h-[100vh]">
            <div className="flex justify-betwen min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">

                <div className="flex mr-auto cursor-pointer hover:scale-110 transition-all">

                    <div className="h-[64px] w-[24px] flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                    </div>
                    <Link className="flex items-center justify-center text-[2rem]" href="/kiosk">
                        <div >이전</div>
                    </Link>
                </div>

                <h1 className="text-[2.5rem] text-center">아이템 구매</h1>
                <div className=" opacity-0 flex mr-auto cursor-default hover:scale-110 transition-all">
                    <div className="h-[64px] w-[24px] flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                    </div>
                    <div className="flex items-center text-[2rem]">이전</div>
                </div>
            </div>
            <div className="min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px] text-[2rem] text-red-500 mt-[16px]">
                사고 싶은 아이템을 선택하세요
            </div>
            <div className="flex flex-wrap min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                {itemList?.map((a, i) => {
                    return (
                        <div key={i} className={`m-[16px] w-[192px]   flex justify-center items-center relative bg-orange-200 shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg ${a.itemStock <= 0 ? "cursor-default" : "hover:scale-110 transition-all cursor-pointer"} `}>
                            <ItemBuyCard onClick={e => onClick(a)} itemData={a} currencyname={currencyName} currencyemoji={currencyEmoji} />
                        </div>
                    )
                })}
            </div>


        </div >
    )
}