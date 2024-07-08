'use client'

import { useState, useEffect } from "react"
import FinishQuestModal from "./components/finishQuestModal"
import DeleteQuestCardModal from "./components/deleteQuestCardModal"
export default function QuestDetail({ params }) {

    const [data, setData] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/api/fetchQuestDetail', {
                method: "POST",
                body: JSON.stringify(params),
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const result = await response.json();
            console.log(result)
            setData(result.data);
            setRole(result.role);
            setStudentList(result.data.studentList)


        };

        fetchData();
    }, []);




    const onChange = (e) => {
        const { name, value } = e.target;
        setStudentList(prev =>
            prev.map(a =>
              a.userId === name ? { ...a, done: a.done ^ 1 } : a
            ))
        // setData({ ...data, done: tmp })
        fetch("/api/setQuestDone", {
            method: "POST",
            body: JSON.stringify({ userId: name, _id: data._id }),
            headers: {
                "Content-Type": "application/json",
            },
        })
    }

    return (

        data.length !== 0
            ? <div className="flex justify-center ">
                <div className="text-[1.2rem] mt-[32px] text-orange-500 flex flex-col justify-center w-[896px] max-[896px]:w-[744px] max-[744px]:w-[592px] max-[592px]:w-[440px] max-[440px]:w-[288px]">
                    <div className="flex items-center">
                        <h1 className="text-[2rem] font-bold ">{data.questName}</h1>
                        <div className="badge bg-orange-500 text-white ml-[8px]">{data.questReward.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                    </div>
                    <h2 className="text-orange-300">{data.questContent}</h2>

                    <div className="flex flex-wrap justify-start gap-[16px] mt-[48px]">
                        {studentList.map((a, i) => {
                            return (
                                <label className="swap swap-flip text-9xl" key={i}>
                                    {role === "teacher" 
                                        ? <input type="checkbox" checked={a.done} onChange={onChange} name={a['userId']} />
                                        : <input type="checkbox" checked={a.done} readOnly name={a['userId']} />}


                                    <div className="swap-on relative">
                                        <div className="bg-orange-200 text-gray-600 font-bold text-[1.5rem] flex justify-center items-center  w-[136px] h-[180px] opacity-30">
                                            {a['userName']}
                                        </div>
                                        <div className="text-red-500 w-[136px] h-[180px] absolute flex justify-center top-0 items-center font-bold text-[1.7rem]">Checked</div>
                                    </div>
                                    <div className="swap-off">
                                        <div className="bg-orange-200 text-gray-600 font-bold text-[1.5rem] flex justify-center items-center  w-[136px] h-[180px]">
                                            {a['userName']}
                                        </div>
                                    </div>
                                </label>
                            )
                        })}

                    </div>
                    {role === "teacher"
                        ? data.finished
                            ? <button className="w-[100%] btn mt-[48px] mb-[16px] shadow-none text-white hover:bg-red-600 bg-red-400 border-0  font-bold text-[1.4rem]" onClick={() => document.getElementById('my_modal_3').showModal()}>삭제</button>
                            : <button className="w-[100%] btn mt-[48px] mb-[16px] shadow-none text-white hover:bg-orange-500 bg-orange-300 border-0  font-bold text-[1.4rem]" onClick={() => document.getElementById('my_modal_2').showModal()}>종료</button>
                        : null
                    }

                </div>
                <FinishQuestModal userData={studentList} questData={data}/>
                <DeleteQuestCardModal data={data} />
            </div>
            : <div></div>


    )

}