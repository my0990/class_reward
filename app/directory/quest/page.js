'use client'
import QuestCard from "./components/QuestCard";
import AddQuestBtn from "./components/AddQuestBtn";
import AddQuestModal from "./components/AddQuestModal";

import { useState, useEffect } from "react"

export default function Quest() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);
    const [teacherId, setTeacherId] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/api/fetchQuestList', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const result = await response.json();
            setData(result.data);
            setTeacherId(result.teacher)
            setIsLoading(false);
            setRole(result.role);

        };
        fetchData();
    }, []);

    return (
        isLoading
            ? <div></div>
            : <div className="flex justify-center ">
                <div className="flex justify-center flex-col items-center bg-yellow-100 my-[32px] max-[600px]:my-0 p-[64px] max-[600px]:p-[16px] py-[40px] rounded-xl w-[600px] max-[600px]:w-[100%]">
                    <div className="w-[100%] text-[2rem] text-red-900 font-bold ">
                        <span className="border-l-8 border-orange-500 pl-[16px]">발행된 임무 목록</span>
                    </div>
                    <div className="w-[100%]">
                        {data.map((a, i) => {
                            return (
                                <QuestCard key={i} data={a} teacherId={teacherId} studentsCount={a.studentList.length}/>
                            )
                        })}
                        {role==="teacher" && <AddQuestBtn />}
                    </div>
                </div>
                {role==="teacher" && <AddQuestModal />}
            </div>
    )
}