'use client'
import { useState, useRef } from "react"
import { mutate } from "swr"
// import { ObjectId } from "mongodb"

export default function AddQuestModal({ currencyEmoji }) {
    const [input, setInput] = useState({ questName: '', questGoal: '', questReward: '', questExp: '', questTitle: '' })

    const onChange = (e) => {
        const { name, value } = e.target


        const numberValue = Number(value);
        if (name === 'questTitle' || name === 'questName' || name === 'questGoal') {
            setInput({ ...input, [name]: value })
            return
        }
        if (/^\d*$/.test(numberValue)) {
            setInput({ ...input, [name]: value })

        }


    }
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/addQuest", {
            method: "POST",
            body: JSON.stringify(input),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((response) => {
            if (response.result === true) {
                document.getElementById('my_modal_2').close()
                setInput(prev => ({ questName: '', questGoal: '', questReward: '', questExp: '', questTitle: '' }))
                mutate(
                    "/api/fetchQuestList",
                    (prev) => {

                        // let convertedQuestId = ObjectId.createFromHexString(response.questId);
                        return [ { ...input, _id: response.questId,finished: [],  time: new Date() },...prev,];
                    },
                    false // 서버 요청 없이 즉시 반영
                );
            }
        })
    }
    const onCloseModal = () => {
        document.getElementById('my_modal_2').close()
        setInput(prev => ({ questName: '', questGoal: '', questRward: '', questExp: '', questTitle: '' }))
    }
    return (
        <dialog id="my_modal_2" className="modal  w-[100%]">

            <div className="modal-box max-w-[600px] p-[32px] border-0  text-red-900 text-[1.2rem]">
                <div className="flex justify-center flex-col ">
                    <h1 className="text-red-900 font-bold text-[2rem] text-center mb-[8px]">퀘스트 등록하기</h1>
                    <h2 className="font-bold"  >퀘스트 이름</h2>
                    <input className="border-2 focus:outline-orange-500 mb-[16px] p-[8px]" name="questName" onChange={onChange} value={input.questName} />
                    <h2 className="font-bold"  >퀘스트 목표</h2>
                    <input className="border-2 focus:outline-orange-500 mb-[16px] p-[8px]" name="questGoal" onChange={onChange} value={input.questGoal} />
                    <h2 className="font-bold"  >퀘스트 보상</h2>
                    <div className="mb-[8px]">
                        <div className="flex justify-between mb-[8px] h-[32px]">
                            <div className="flex items-center cursor-default">
                                <input id="questReward" readOnly type="checkbox" tabIndex="-1" checked={input.questReward} className="cursor-default checkbox checkbox-warning mr-[8px]" />
                                <label htmlFor="questReward" className="cursor-default">쿠키</label>
                            </div>
                            <div className="flex">
                                <div className="border-b-4 border-orange-400">{currencyEmoji}</div>
                                <input onChange={onChange} name="questReward" placeholder="숫자만 입력" value={input.questReward} className="placeholder:text-center w-[160px] text-right cursor-pointer disabled:bg-transparent disabled:border-transparent border-orange-400 disabled:cursor-default  outline-none border-b-4 " />
                            </div>
                        </div>
                        <div className="flex justify-between mb-[8px] h-[32px]">
                            <div className="flex items-center cursor-default">
                                <input id="questExp" readOnly type="checkbox" tabIndex="-1" checked={input.questExp} className="cursor-default checkbox checkbox-warning mr-[8px]" />
                                <label htmlFor="questExp" className="cursor-defaultr">경험치</label>
                            </div>
                            <div className="flex">
                                <div className="border-b-4 border-orange-400">🆙</div>
                                <input onChange={onChange} name="questExp" placeholder="숫자만 입력" value={input.questExp} className="placeholder:text-center w-[160px] text-right cursor-pointer disabled:bg-transparent disabled:border-transparent border-orange-400 disabled:cursor-default  outline-none border-b-4 " />
                            </div>
                        </div>
                        <div className="flex justify-between mb-[8px] h-[32px]">
                            <div className="flex items-center cursor-default">
                                <input id="questTitle" readOnly type="checkbox" tabIndex="-1" checked={input.questTitle} className="cursor-default checkbox checkbox-warning mr-[8px]" />
                                <label htmlFor="questTitle" className="cursor-default">칭호</label>
                            </div>
                            <div className="flex">
                                <div className="border-b-4 border-orange-400">🍊</div>
                                <input onChange={onChange} name="questTitle" value={input.questTitle} className="w-[160px] text-right cursor-pointer disabled:bg-transparent disabled:border-transparent border-orange-400 disabled:cursor-default  outline-none border-b-4" />
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