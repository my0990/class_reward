'use client'


import BuyModal from "./buyModal"
import { useState, useRef } from "react"
import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';
import ItemCard from "./ItemCard"
import { fetchData } from "@/hooks/swrHooks"



export default function MarketTemplate({ tmpItemList }) {
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    const { data: userData, isLoading: isUserLoading, isError: isUserError } = fetchData('/api/fetchUserData');


    const onBuy = (picked) => {
        document.getElementById('buy').showModal()
        setBuyList(picked)

    }

    const [buyList, setBuyList] = useState();
    const nodeRef = useRef();
    if (isClassLoading || isUserLoading) return <div>Loading data...</div>;
    if (isClassError || isUserError) return <div>Error loading data</div>;


    const { currencyEmoji, currencyName, itemList } = classData;
    const { userId } = userData;
    if (itemList.length === 0) {
        return (
            <div className="text-[2rem] text-center">등록된 아이템이 없습니다.</div>
        )
    }
    return (

        <div className="flex justify-center">
            <div className=" min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                <div noderef={nodeRef} className="flex p-[8px] flex-wrap">
                    {itemList?.map((a, i) =>
                    (

                        <div key={i} className={`m-[16px] w-[192px] flex justify-center items-center relative bg-orange-200 shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg ${a.itemQuantity <= 0 ? "cursor-default" : "hover:scale-110 transition-all cursor-pointer"}`} >
                            <ItemCard data={a} onClick={onBuy} currencyName={currencyName} />
                        </div>

                    )
                    )}
                </div>
                <BuyModal buyList={buyList} userId={userId} money={userData?.money} currencyName={currencyName} currencyEmoji={currencyEmoji} />
            </div>
        </div>
    )
}