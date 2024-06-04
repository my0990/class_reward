'use client'
import { useState, useEffect } from "react"
export default function AddQuestModal({ data }) {
    function getTrueKeys(obj) {
        return Object.entries(obj) // 객체의 엔트리를 배열로 변환
          .filter(([key, value]) => value === true) // 값이 true인 엔트리만 필터링
          .map(([key]) => key); // 키만 추출하여 배열로 반환
      }
    let rewarded = []
      console.log(data)
    if(data.length!= 0){
        rewarded = getTrueKeys(data.done)
    }
    console.log(rewarded)
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/finishQuest", {
            method: "POST",
            body: JSON.stringify({ data: data, rewarded: rewarded }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
                alert('성공하였습니다.')
                location.reload();
            }
        })
    }


    return (
        <dialog id="my_modal_2" className="modal  w-[100%]">

            <div className="modal-box max-w-[600px] border-0 p-[32px]">
                <div className="flex justify-center flex-col text-[1.3rem]">
                    <h1 className="text-[1.8rem] mb-[16px] font-bold"><span>퀘스트</span>를 종료하고</h1>
                    <div className="flex flex-wrap">{rewarded.map((a,i)=>{
                        return(
                            <div key={i} className=" mr-[4px]"><span className="bg-orange-200">{a}</span>{i < rewarded.length - 1 && ', '}</div>
                        )
                    })}에게</div>
                    <div className="mt-[16px]"><span className="font-bold text-orange-500">{data?.questReward?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원</span>을 지급합니다.</div>
                    <form onSubmit={onSubmit} className="mt-[32px]">
                        <button className="btn mt-[16px] w-[100%] bg-orange-500 border-0 text-white m-auto focus:outline-none text-[1.1rem]">확인</button>
                    </form>
                    <button onClick={() => document.getElementById('my_modal_2').close()} className="btn mt-[16px] w-[100%] text-[1.1rem] bg-white border-0 shadow-transparent focus:outline-none hover:bg-orange-500 hover:text-white text-orange-500 m-auto">취소</button>
                </div>
            </div>


            <form method="dialog" className="modal-backdrop" onClick={() => document.getElementById('my_modal_2').close()}>
                <button>close</button>
            </form>
        </dialog>
    )
}