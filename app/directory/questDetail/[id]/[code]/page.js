'use client'

import { useState, useEffect } from "react"


export default function QuestDetail({ params }) {

    const [data, setData] = useState([]);
    const [nameList, setNameList] = useState([]);
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
            setData(result.data);


            setNameList(Object.keys(result.data.done))

        };

        fetchData();
    }, []);




    const onChange = (e) => {
        const { name, value } = e.target;
        let tmp = data.done;
        tmp[name] = !data.done[name]
        setData({ ...data, done: tmp })
        fetch("/api/setQuestDone", {
            method: "POST",
            body: JSON.stringify({ name: name, id: data._id }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
            }
        })
    }
    return (
        <div className="flex justify-center ">
            <div className="text-[1.2rem] mt-[32px] text-orange-500 flex flex-col justify-center w-[896px] max-[896px]:w-[744px] max-[744px]:w-[592px] max-[592px]:w-[440px] max-[440px]:w-[288px]">
                <div className="flex items-center">
                    <h1 className="text-[2rem] font-bold ">{data.questName}</h1>
                    <div className="badge bg-orange-500 text-white ml-[8px]">100,000</div>
                </div>
                <h2 className="text-orange-300">{data.questContent}</h2>

                <div className="flex flex-wrap justify-start gap-[16px] mt-[48px]">
                    {nameList.map((a, i) => {
                        return (
                            <label className="swap swap-flip text-9xl" key={i}>

                                <input type="checkbox" checked={data.done[a]} onChange={onChange} name={a} />
                                <div className="swap-on relative">
                                    <div className="bg-orange-200 text-gray-600 font-bold text-[1.5rem] flex justify-center items-center  w-[136px] h-[180px] opacity-30">
                                        {a}
                                    </div>
                                    <div className="text-red-500 w-[136px] h-[180px] absolute flex justify-center top-0 items-center font-bold text-[1.7rem]">Checked</div>
                                </div>
                                <div className="swap-off">
                                    <div className="bg-orange-200 text-gray-600 font-bold text-[1.5rem] flex justify-center items-center  w-[136px] h-[180px]">
                                        {a}
                                    </div>
                                </div>
                            </label>
                        )
                    })}

                </div>
                <button className="btn mt-[48px] shadow-none text-white hover:bg-orange-500 bg-orange-300 border-0  font-bold text-[1.4rem]">종료</button>
            </div>
        </div>

    )

}