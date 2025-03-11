'use client'

import QuestCard from "./QuestCard";
import AddQuestBtn from "./AddQuestBtn";
import AddQuestModal from "./AddQuestModal";
import QuestDetailTemplate from "./detail/QuestDetailTemplate";
import { fetchData } from "@/hooks/swrHooks";
import { useState } from "react";

export default function Quest({ role }) {
    const { data: questListData, isLoading: isQuestListLoading, isError: isQuestListError } = fetchData('/api/fetchQuestList');
    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = fetchData('/api/fetchClassData');
    const { data: studentData, isLoading: isStudentDataLoading, isError: isStudentDataError } = fetchData('/api/fetchStudentData');

    const [isDetail, setIsDetail] = useState(false);
    const [questDetailData, setQuestDetailData] = useState({});

    if (isQuestListLoading || isClassDataLoading || isStudentDataLoading) return <div>Loading data...</div>;
    if (isQuestListError || isClassDataError || isStudentDataError) return <div>Error loading data</div>;


    const { currencyEmoji, teacherId } = classData;
    const studentCount = studentData.length
    console.log(questDetailData)
    if (isDetail) {
        return (
            <QuestDetailTemplate setIsDetail={setIsDetail} role={role} classData={classData} studentData={studentData} questDetailData={questDetailData} setQuestDetailData={setQuestDetailData} />
        )
    }
    return (

        <div className="flex justify-center ">
            <div className="flex justify-center flex-col items-center bg-yellow-100 my-[32px] max-[600px]:my-0 p-[64px] max-[600px]:p-[16px] py-[40px] rounded-xl w-[600px] max-[600px]:w-[100%]">
                <div className="flex items-center justify-between mr-[8px] w-[100%] text-[2rem] text-red-900 font-bold ">
                    <span className="border-l-8 border-orange-500 pl-[16px]">임무 목록</span>
                    {role === 'teacher' && <div onClick={() => document.getElementById('my_modal_2').showModal()}>
                        {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-[40px] h-[40px]">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg> */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="cursor-pointer transition-all hover:scale-[120%] w-[40px] h-[40px] text-orange-400 hover:text-orange-500">
                            <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" />
                        </svg>

                    </div>}
                </div>
                <div className="w-[100%]">
                    {questListData.map((a, i) => {
                        return (
                            <QuestCard key={i} data={a} setQuestDetailData={setQuestDetailData} studentCount={studentCount} teacherId={teacherId} setIsDetail={setIsDetail} role={role}/>
                        )
                    })}
                    {/* {role === "teacher" && <AddQuestBtn />} */}
                </div>
            </div>
            {role === "teacher" && <AddQuestModal currencyEmoji={currencyEmoji} />}
        </div>
    )
}