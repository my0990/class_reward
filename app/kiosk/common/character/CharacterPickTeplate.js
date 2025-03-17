import CharacterCard from "./CharacterCard"
import CheckPwdModal from "./CheckPwdModal"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mutate } from "swr";
import { fetchData } from "@/hooks/swrHooks";
export default function CharacterPickTemplate({ type, requestData, setRequestData }) {
    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = fetchData('/api/fetchClassData');
    const { data: studentData, isLoading: isStudentDataLoading, isError: isStudentDataError } = fetchData('/api/fetchStudentData');
    const route = useRouter();
    const [rotation, setRotation] = useState(0);


    const onClick = (a) => {
        if (type === "thermometer" && a.money <= 0) {
            alert('빈털털이입니다')

        } else {


            document.getElementById('my_modal_3').showModal()
            setRequestData(prev => ({ ...prev, userData: a }))
        }
    }
    const onPrevious = () => {
        if (type === "buy") {
            setRequestData(prev => ({ ...prev, step: "buyItemPick" }))
        } else if (type === "use") {
            route.push('/kiosk')
        } else {
            setRequestData(prev => ({ ...prev, step: "thermometerBoard" }))
        }
    }
    const onRefresh = () => {
        setRotation((prev) => prev + 360);
        mutate(`/api/fetchStudentData`)
    }
    if (isClassDataLoading || isStudentDataLoading) return <div>Loading data...</div>;
    if (isClassDataError || isStudentDataError) return <div>Error loading data</div>;

    const { currencyEmoji, currencyName } = classData;
    const { startExp, commonDifference } = classData.expTable;
    return (
        <div className="">
            <div className="flex justify-center">
                <div className="w-[1410px] max-[1410px]:w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
                    <div className="flex justify-center flex-col items-center overflow-hidden " >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex  cursor-pointer hover:scale-110 transition-all" onClick={onPrevious}>
                                <div className="h-[64px] w-[24px] flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                                </div>
                                <div className="flex items-center text-[2rem]" >이전</div>
                            </div>
                            <h1 className="text-[2rem] flex items-center">{type === "use" ? "아이템 사용" : "학급 온도계 기부"}</h1>
                            <div className=" flex  cursor-pointer hover:scale-110 transition-all">

                                {type !== 'use' ? <div onClick={() => route.push('/kiosk')} className="flex items-center text-[2rem]">처음으로</div> : <div></div>}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-[2rem] text-red-500 mt-[8px] ml-[8px]">계정을 선택하세요</div>
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