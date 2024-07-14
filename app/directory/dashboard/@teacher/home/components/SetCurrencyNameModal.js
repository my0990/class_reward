'use client'
import { useRef, useState } from "react";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => {
    return import('emoji-picker-react');
}, { ssr: false });

export default function SetCurrencyNameModal() {
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/setCurrencyName", {
            method: "POST",
            body: JSON.stringify({ currencyName: ref.current.value }),
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


    const [inputStr, setInputStr] = useState("");
    const onEmojiClick = (emojiObject) => {
        console.log(emojiObject)
        setInputStr((prevInput) => prevInput + emojiObject.emoji);

      };
    return (
        <dialog id="my_modal_1" className="modal " tabIndex="-1">
            <div className={`modal-box p-[32px]`} >
                <div className="text-[1.5rem]">우리반 화폐의 이름을 설정해 주세요</div>
                <div>예&#41; 꿈싹, 쿠키, 원</div>
                <div className="flex mt-[16px]">
                    <input ref={ref}                          value={inputStr} className="border-2 mr-[16px] border-orange-300 focus:border-orange-500 focus:outline-none"></input>
                    <form onSubmit={onSubmit}>
                        <button className="bg-orange-300 px-[16px] py-[8px] rounded-lg font-bold  hover:text-white">확인</button>
                    </form>
                </div>
                <div>
                    <h1>Emoji Picker React Example</h1>
                    <input
                        className="input-style"
                        value={inputStr}
                        onChange={(e) => setInputStr(e.target.value)}
                    />
                    <EmojiPicker onEmojiClick={onEmojiClick}/>

                </div>
            </div>

        </dialog>
    )
}