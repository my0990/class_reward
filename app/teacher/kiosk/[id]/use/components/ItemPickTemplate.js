
import { useState, useEffect } from "react";
import { useFetchData } from "@/hooks/useFetchData";
import ItemCard from "./ItemCard";
import { useRouter } from "next/navigation";
import ConfirmItemUse from "./ConfirmItemUse";
import { mutate } from "swr";
export default function ItemPickTemplate({ requestData, setRequestData, classId }) {

    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = useFetchData(`/api/classData/${classId}`);
    const { itemList } = requestData.userData;
    const [rotation, setRotation] = useState(0);
    const [pickedItem, setPickedItem] = useState({});
    const route = useRouter();


    const onPrevious = () => {
        setRequestData(prev => ({ ...prev, step: 'useCharacterPick' }))
    }

    const onClick = (a) => {
        setPickedItem(a);
        document.getElementById('confirmModal').showModal();
    }

    const onRefresh = () => {
        setRotation((prev) => prev + 360);
        mutate(`/api/students/${classId}`)
    }

    if (isClassDataLoading) return <div>Loading data...</div>;
    if (isClassDataError) return <div>Error loading data</div>;


    const { currencyEmoji, currencyName } = classData;
    return (
        <div className="flex flex-col  items-center relative  bg-orange-100 min-h-[100vh]">
            <div className="flex justify-between min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">

                <div className="flex  cursor-pointer hover:scale-110 transition-all">

                    <div className="h-[64px] w-[24px] flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                    </div>

                    <div onClick={onPrevious} className="flex items-center justify-center text-[2rem]" >이전</div>

                </div>
                <div className="flex">
                    <h1 className="text-[2.5rem] text-center">아이템을 선택하세요</h1>
                    <div onClick={onRefresh} style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0.5s ease-in-out" }} className=" flex items-center ml-5 cursor-pointer hover:scale-105 transition-all" >
                        <svg width="32px" height="32px" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="none" fillRule="evenodd" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" transform="matrix(0 1 1 0 2.5 2.5)"> <path d="m3.98652376 1.07807068c-2.38377179 1.38514556-3.98652376 3.96636605-3.98652376 6.92192932 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8"></path> <path d="m4 1v4h-4" transform="matrix(1 0 0 -1 0 6)"></path> </g> </g></svg>
                    </div>
                </div>
                <div className="flex items-center cursor-pointer hover:scale-110 transition-all">
                    <div className="  cursor-pointer hover:scale-110 transition-all">

                        <div onClick={() => route.push(`/teacher/kiosk/${classId}`)} className="flex items-center text-[2rem]">처음으로</div>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                {itemList?.map((a, i) => {
                    return (
                        <div key={i} className={`m-[16px] w-[192px]   flex justify-center items-center relative bg-orange-200 shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg ${a.itemStock <= 0 ? "cursor-default" : "hover:scale-110 transition-all cursor-pointer"} `}>
                            <ItemCard onClick={(e) => onClick(a)} itemData={a} currencyname={currencyName} currencyemoji={currencyEmoji} />

                        </div>
                    )
                })}
            </div>
            <ConfirmItemUse userData={requestData.userData} itemData={pickedItem} classId={classId} />
        </div >
    )
}