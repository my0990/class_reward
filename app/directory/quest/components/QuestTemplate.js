'use client'

import QuestCard from "./QuestCard";
import AddQuestBtn from "./AddQuestBtn";
import AddQuestModal from "./AddQuestModal";
import { fetchData } from "@/hooks/swrHooks";


export default function Quest({ role }) {
    const { data: questListData, isLoading: isQuestListLoading, isError: isQuestListError } = fetchData('/api/fetchQuestList');
    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = fetchData('/api/fetchClassData');
    const { data: studentData, isLoading: isStudentDataLoading, isError: isStudentDataError } = fetchData('/api/fetchStudentData');


    if (isQuestListLoading || isClassDataLoading || isStudentDataLoading) return <div>Loading data...</div>;
    if (isQuestListError || isClassDataError || isStudentDataError) return <div>Error loading data</div>;


    const {currencyEmoji, teacherId} = classData;
    const studentCount = studentData.length
    return (

        <div className="flex justify-center ">
            <div className="flex justify-center flex-col items-center bg-yellow-100 my-[32px] max-[600px]:my-0 p-[64px] max-[600px]:p-[16px] py-[40px] rounded-xl w-[600px] max-[600px]:w-[100%]">
                <div className="w-[100%] text-[2rem] text-red-900 font-bold ">
                    <span className="border-l-8 border-orange-500 pl-[16px]">발행된 임무 목록</span>
                </div>
                <div className="w-[100%]">
                    {questListData.map((a, i) => {
                        return (
                            <QuestCard key={i} data={a} studentCount={studentCount} teacherId={teacherId}/>
                        )
                    })}
                    {role === "teacher" && <AddQuestBtn />} 
                </div>
            </div>
            {role === "teacher" && <AddQuestModal currencyEmoji={currencyEmoji}/>}
        </div>
    )
}