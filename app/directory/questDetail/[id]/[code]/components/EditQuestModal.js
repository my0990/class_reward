'use client'
import { useEffect } from "react"
import { useState, useRef } from "react"
import { mutate } from "swr"
export default function AddQuestModal({currencyEmoji, questDetailData, code}) {
    const [input, setInput] = useState({ name: '', goal: '', reward: '', exp: '', title: '' })

    const onChange = (e) => {
        const { name, value } = e.target
        setInput({ ...input, [name]: value })
    }
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/editQuest", {
            method: "POST",
            body: JSON.stringify(input),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
                document.getElementById('editQuestModal').close()
                setInput(prev => ({...prev, name: '', goal: '', reward: '', exp: '', title: '' }))
                mutate(`/api/fetchQuestDetail/${code}`)
            }
        })
    }
    const onCloseModal = () => {
        document.getElementById('editQuestModal').close()
        setInput((prev)=> ({...prev, name: questDetailData.questName, goal: questDetailData.questGoal, reward: questDetailData.questReward, exp: questDetailData.questExp, title: questDetailData.questTitle}))
    }
    useEffect(()=>{
        if(questDetailData){
            setInput((prev)=> ({...prev, name: questDetailData.questName, goal: questDetailData.questGoal, reward: questDetailData.questReward, exp: questDetailData.questExp, title: questDetailData.questTitle}))
        }
    },[questDetailData])
    return (
        <dialog id="editQuestModal" className="modal  w-[100%]">

            <div className="modal-box max-w-[600px] p-[32px] border-0  text-red-900 text-[1.2rem]">
                <div className="flex justify-center flex-col ">
                    <h1 className="text-red-900 font-bold text-[2rem] text-center mb-[8px]">퀘스트 수정하기</h1>
                    <h2 className="font-bold"  >퀘스트 이름</h2>
                    <input className="border-2 focus:outline-orange-500 mb-[16px] p-[8px]" name="name" onChange={onChange} value={input.name} />
                    <h2 className="font-bold"  >퀘스트 목표</h2>
                    <input className="border-2 focus:outline-orange-500 mb-[16px] p-[8px]" name="goal" onChange={onChange} value={input.goal} />
                    <h2 className="font-bold"  >퀘스트 보상</h2>
                    <div className="mb-[8px]">
                        <div className="flex justify-between mb-[8px] h-[32px]">
                            <div className="flex items-center">
                                <input id="currency" type="checkbox" tabIndex="-1" checked={input.reward} className="cursor-pointer checkbox checkbox-warning mr-[8px]" />
                                <label for="currency" className="cursor-pointer">쿠키</label>
                            </div>
                            <div className="flex">
                                <div className="border-b-4 border-orange-400">{currencyEmoji}</div>
                                <input onChange={onChange} name="reward" value={input.reward} className="w-[160px] text-right cursor-pointer disabled:bg-transparent disabled:border-transparent border-orange-400 disabled:cursor-default  outline-none border-b-4 " />
                            </div>
                        </div>
                        <div className="flex justify-between mb-[8px] h-[32px]">
                            <div className="flex items-center">
                                <input id="exp" type="checkbox" tabIndex="-1" checked={input.exp} className="cursor-pointer checkbox checkbox-warning mr-[8px]" />
                                <label for="exp" className="cursor-pointer">경험치</label>
                            </div>
                            <div className="flex">
                                <div className="border-b-4 border-orange-400">🆙</div>
                                <input onChange={onChange} name="exp" value={input.exp} className="w-[160px] text-right cursor-pointer disabled:bg-transparent disabled:border-transparent border-orange-400 disabled:cursor-default  outline-none border-b-4 " />
                            </div>
                        </div>
                        <div className="flex justify-between mb-[8px] h-[32px]">
                            <div className="flex items-center">
                                <input id="title" type="checkbox" tabIndex="-1" checked={input.title} className="cursor-pointer checkbox checkbox-warning mr-[8px]" />
                                <label for="title" className="cursor-pointer">칭호</label>
                            </div>
                            <div className="flex">
                                <div className="border-b-4 border-orange-400">🍊</div>
                                <input onChange={onChange} name="title" value={input.title} className="w-[160px] text-right cursor-pointer disabled:bg-transparent disabled:border-transparent border-orange-400 disabled:cursor-default  outline-none border-b-4" />
                            </div>
                        </div>
                    </div>
                    {/* <input className="border-2 focus:outline-orange-500 mb-[16px] p-[8px]" onChange={onChange} value={quest.reward || ''} type="number" name="reward"/> */}
                    <form onSubmit={onSubmit}>
                        <button className="btn mt-[16px] w-[100%] bg-orange-500 border-0 text-white m-auto text-[1.2rem] focus:outline-none">확인</button>
                    </form>
                    <button onClick={onCloseModal} className="btn mt-[16px] text-[1.2rem] w-[100%] bg-white border-0 shadow-transparent focus:outline-none hover:bg-orange-500 hover:text-white text-orange-500 m-auto">취소</button>
                </div>
            </div>


            <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
                <button>close</button>
            </form>
        </dialog>
    )
}