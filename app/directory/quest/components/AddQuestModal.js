'use client'
import { useState } from "react"
export default function AddQuestModal() {
    const [quest, setQuest] = useState({ name: '', content: '', reward: null })
    const onChange = (e) => {
        const { name, value } = e.target
        setQuest({ ...quest, [name]: value })
    }
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/addQuest", {
            method: "POST",
            body: JSON.stringify(quest),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
                alert('등록하였습니다')
                location.reload();
            }
        })
    }
    return (
        <dialog id="my_modal_2" className="modal  w-[100%]">

            <div className="modal-box max-w-[600px] bg-yellow-100 border-0  text-red-900 text-[1.2rem]">
                <div className="flex justify-center flex-col ">
                    <h1 className="text-red-900 font-bold text-[2rem] text-center mb-[8px]">퀘스트 등록하기</h1>
                    <h2 className="font-bold"  >퀘스트 이름</h2>
                    <input className="border-2 focus:outline-orange-500 mb-[16px] p-[8px]" name="name" onChange={onChange} value={quest.name}/>
                    <h2 className="font-bold"  >퀘스트 내용</h2>
                    <input className="border-2 focus:outline-orange-500 mb-[16px] p-[8px]" name="content" onChange={onChange} value={quest.content}/>
                    <h2  className="font-bold"  >퀘스트 보상</h2>
                    <input className="border-2 focus:outline-orange-500 mb-[16px] p-[8px]" onChange={onChange} value={quest.reward || ''} type="number" name="reward"/>
                    <form onSubmit={onSubmit}>
                        <button className="btn mt-[16px] w-[100%] bg-orange-500 border-0 text-white m-auto focus:outline-none">확인</button>
                    </form>
                    <button onClick={() => document.getElementById('my_modal_2').close()} className="btn mt-[16px] w-[100%] bg-yellow-100 border-0 shadow-transparent focus:outline-none hover:bg-orange-500 hover:text-white text-orange-500 m-auto">취소</button>
                </div>
            </div>


            <form method="dialog" className="modal-backdrop" onClick={() => document.getElementById('my_modal_2').close()}>
                <button>close</button>
            </form>
        </dialog>
    )
}