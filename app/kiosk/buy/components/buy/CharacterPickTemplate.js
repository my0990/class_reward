import CharacterCard from "@/app/kiosk/common/character/CharacterCard";
import CheckPwdModal from "@/app/kiosk/common/character/CheckPwdModal";
import { fetchData } from "@/hooks/swrHooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mutate } from "swr";

export default function CharacterPickTemplate({ type, requestData, setRequestData }) {
    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = fetchData('/api/fetchClassData');
    const { data: studentData, isLoading: isStudentDataLoading, isError: isStudentDataError } = fetchData('/api/fetchStudentData');

    const { itemName, itemPrice, itemExplanation, itemStock, emoji } = requestData.itemData;
    const [rotation, setRotation] = useState(0);
    const route = useRouter();
    const onRefresh = () => {
        setRotation((prev) => prev + 360);
        mutate(`/api/fetchStudentData`)
    }
    const onPrevious = () => {
        if (type === "buy") {
            setRequestData(prev => ({ ...prev, step: "buyItemPick" }))
        } else if (type === "use") {
            route.push('/kiosk')
        } else {
            setRequestData({ menu: "thermometer", step: 'thermometerBoard' })
        }
    }

    if (isClassDataLoading || isStudentDataLoading) return <div>Loading data...</div>;
    if (isClassDataError || isStudentDataError) return <div>Error loading data</div>;

    const { currencyEmoji, currencyName } = classData;
    const { startExp, commonDifference } = classData.expTable;

    function getCorrectMessage(word) {
        const lastChar = word[word.length - 1];
        const hasJongseong = (lastChar.charCodeAt(0) - 44032) % 28 !== 0; // 종성이 있는지 확인
        return `${word}${hasJongseong ? "이" : "가"} 모자랍니다.`;
    }

    const onClick = (a) => {
        if (a.money < itemPrice) {

            alert(getCorrectMessage(currencyName));
            return
        }
        document.getElementById('my_modal_3').showModal()
        setRequestData(prev => ({ ...prev, userData: a }))

    }
    return (



        <div className="flex flex-col items-center justify-center">
            <div className="w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
                <div className="flex pt-[8px] items-center justify-between w-full">
                    <div className="flex  cursor-pointer hover:scale-110 transition-all" onClick={onPrevious}>
                        <div className=" flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                        </div>
                        <div className="flex items-center text-[2rem]" >이전</div>
                    </div>
                    <h1 className="text-[2rem] flex items-center">아이템 구매</h1>
                    <div className=" flex  cursor-pointer hover:scale-110 transition-all">

                        <div onClick={() => route.push('/kiosk')} className="flex items-center text-[2rem]">처음으로</div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col mt-[16px] w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
                <div>
                    {/* <div className="ml-[8px] text-[2rem]">
                        선택된 아이템
                    </div> */}
                    <div className="p-[32px] flex   bg-orange-100 rounded-xl mt-[8px]">
                        <div className="text-[136px] text-center leading-none mr-[32px]">
                            {emoji}
                        </div>
                        <div>
                            <div className="text-[1.6rem]  whitespace-nowrap overflow-hidden text-ellipsis ">
                                {itemName}
                            </div>
                            <div className="text-gray-500 text-[1.4rem] overflow-y-auto mb-[8px]">
                                {itemExplanation}
                            </div>
                            <div className=" flex">
                                <div className="text-[1.2rem]">남은수량: {itemStock}</div>
                            </div>
                            <div className="text-[1.5rem] text-red-500 mt-[8px]">
                                {itemPrice}<span className="ml-[4px]">{currencyName}</span>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="mt-[32px] pb-[32px]">
                    <div className="flex justify-between items-center">
                        <div className="ml-[8px] text-[2rem] text-red-500 ">구매할 계정을 선택해주세요</div>
                        <div onClick={onRefresh} style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0.5s ease-in-out" }} className=" top-10 right-10 mr-[16px] cursor-pointer hover:scale-105 transition-all" >
                            <svg width="32px" height="32px" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="none" fill-rule="evenodd" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" transform="matrix(0 1 1 0 2.5 2.5)"> <path d="m3.98652376 1.07807068c-2.38377179 1.38514556-3.98652376 3.96636605-3.98652376 6.92192932 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8"></path> <path d="m4 1v4h-4" transform="matrix(1 0 0 -1 0 6)"></path> </g> </g></svg>
                        </div>
                    </div>
                    <div className="flex flex-wrap ">
                        {studentData.map((a, i) => {
                            return (
                                <CharacterCard key={i} onClick={e => onClick(a)} user={a} currencyname={currencyName} currencyemoji={currencyEmoji} startExp={startExp} commonDifference={commonDifference} />
                            )
                        })}
                    </div>
                </div>


            </div>
            <CheckPwdModal type={type} requestData={requestData} setRequestData={setRequestData} />
        </div>
    )
}