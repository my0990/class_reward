'use client'
import { useRef, useState } from "react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'


export default function SetCurrencyNameModal() {
    const [step, setStep] = useState('name');
    const [classData, setClassData] = useState({ currencyName: null, currencyEmoji: null })
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/setCurrencyName", {
            method: "POST",
            body: JSON.stringify({ data: classData}),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {

                document.getElementById('my_modal_1').close()
                location.reload();
            }
        })
    }
    const ref = useRef();

    const onNameClick = (e) => {
        setClassData({ ...classData, currencyName: e.target.value })
    }

    return (
        <dialog id="my_modal_1" className="modal " tabIndex="-1">
            <div className={`modal-box p-[32px]`} >
                {step === "name"
                    ? <div>
                        <div className="text-[1.5rem]">우리 반 화폐의 이름을 설정해 주세요</div>
                        <div>예&#41; 꿈싹, 쿠키, 원</div>
                        <div className="flex mt-[16px]">
                            <input ref={ref} value={classData.currencyName} onChange={onNameClick} className="border-2 mr-[16px] border-orange-300 focus:border-orange-500 focus:outline-none"></input>
                            <button className="bg-orange-300 px-[16px] py-[8px] rounded-lg font-bold  hover:text-white" onClick={() => classData.currencyName ? setStep("emoji") : alert('화폐의 이름을 입력해주세요')}>다음</button>
                        </div>
                    </div>
                    : step === "emoji"
                        ? <div>
                            <div className="flex items-center">
                                <div className="text-[1.5rem]">우리 반 화폐의 모양을 설정해 주세요 - <span className="text-[1.5rem]">{classData.currencyEmoji}</span></div>

                            </div>
                            {/* <EmojiPicker onEmojiClick={onEmojiClick} /> */}
                            <div className="flex justify-center my-[16px]">
                                <Picker
                                    data={data}
                                    onEmojiSelect={(emojiObject) => setClassData({ ...classData, currencyEmoji: emojiObject.native })}
                                    locale="ko"
                                    emojiButtonColors={[
                                        'rgba(155,223,88,.7)',
                                        'rgba(149,211,254,.7)',
                                        'rgba(247,233,34,.7)',
                                        'rgba(238,166,252,.7)',
                                        'rgba(255,213,143,.7)',
                                        'rgba(211,209,255,.7)',
                                    ]}
                                    categories={[
                                        // 'activity',
                                        // 'flags',
                                        'foods',
                                        // 'frequent',
                                        'nature',
                                        // 'objects',
                                        'people',
                                        'places',
                                        // 'symbols',
                                    ]}
                                />
                            </div>
                            <div className="flex justify-between">
                                <button className="bg-orange-300 px-[16px] py-[8px] rounded-lg font-bold  hover:text-white" onClick={() => setStep("name")}>이전</button>
                                <button className="bg-orange-300 px-[16px] py-[8px] rounded-lg font-bold  hover:text-white" onClick={() => classData.currencyEmoji ? setStep("finish") : alert("화페 모양을 선택해주세요")}>다음</button>
                            </div>
                        </div>
                        : <div >
                            <h1 className="text-[1.5rem]">우리반 화폐 이름: {classData.currencyName}</h1>
                            <h1 className="text-[1.5rem]">우리반 화폐 이모지: {classData.currencyEmoji}</h1>
                            <form onSubmit={onSubmit} className="flex justify-between mt-[16px]">
                            <button className="bg-orange-300 px-[16px] py-[8px] rounded-lg font-bold  hover:text-white" onClick={() => setStep("emoji")}>이전</button>
                                <button className="bg-green-500 px-[16px] py-[8px] rounded-lg font-bold  hover:text-white" >확인</button>
                            </form>
                        </div>}
            </div>
        </dialog>
    )
}