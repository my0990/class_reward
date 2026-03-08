'use client'

import { mutate } from "swr";

export default function FinishQuestModal({ rewardedUserData, questData, currencyName, clearAll, setQuestDetailData }) {

    const onSubmit = (e) => {
        e.preventDefault();

        fetch("/api/finishQuest", {
            method: "POST",
            // body: JSON.stringify({ questData: questData, rewarded: rewardedUserData }),
            body: JSON.stringify({ questData: questData, rewarded: rewardedUserData.map(obj => ({userId: obj.userId,money: obj.money})) }),
            
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
                document.getElementById('my_modal_2').close()
                clearAll();
                mutate(
                    `/api/fetchQuestList`,
                    (prev) => {
                        const updatedArr = prev.map((item) => item._id === questData._id ? { ...item,  finished: [...questData.finished, ...rewardedUserData.map(obj => obj.userId)] } : item)
                        setQuestDetailData({ ...questData, finished: [...questData.finished, ...rewardedUserData.map(obj => obj.userId)] })
                        return updatedArr;
                    },
                    false
                );
            }
        })
    }


    return (
        <dialog id="my_modal_2" className="modal  w-[100%]">

            <div className="modal-box max-w-[600px] border-0 p-[32px]">
                <div className="flex justify-center flex-col text-[1.3rem]">
                    <div className="flex flex-wrap">
                        {rewardedUserData.map((a, i) => {
                            return (
                                <div key={i} className=" mr-[4px]"><span className="bg-orange-200">{a.classNumber}. {a.profileNickname}</span>{i < rewardedUserData.length - 1 && ', '}</div>
                            )
                        })}에게 지급합니다
                    </div>
                    <div className="mt-[16px]">
                        {questData?.questReward && <div>- {questData?.questReward?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{currencyName}</div>}
                        {questData?.questExp && <div>- {questData.questExp}경험치 </div>}
                        {questData?.questTitle && <div>- 칭호: {questData.questTitle}  </div>}
                    </div>

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