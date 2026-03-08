'use client'
import { useRef, useState, useEffect } from "react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { mutate } from "swr";

export default function ClassSection({ currencyEmoji, currencyName, currencyData, setCurrencyData, onCurrencyChange, onCurrencySubmit }) {


    useEffect(() => {
        setCurrencyData({
            currencyEmoji: currencyEmoji ?? "",
            currencyName: currencyName ?? "",

        });
    }, [
        currencyEmoji,
        currencyName,

    ]);





    return (
        <>

            <div>
                <div className="mt-[28px]">
                    <div className="text-[1.5rem]">그림 설정</div>
                    <div className="flex">
                        <span className="text-[20rem]">{currencyData.currencyEmoji}</span>
                        <Picker
                            data={data}
                            name="currencyEmoji"
                            onEmojiSelect={(emojiObject) => setCurrencyData(prev => ({ ...prev, currencyEmoji: emojiObject.native }))}
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
                                'activity',
                                'flags',
                                'foods',
                                'frequent',
                                'nature',
                                'objects',
                                'people',
                                'places',
                                'symbols',
                            ]}
                        />
                    </div>
                </div>
                <h2 className=" text-[1.5rem]">이름 설정</h2>
                <input className="border-2 focus:outline-orange-500 h-[36px] w-[100%]" onChange={onCurrencyChange} name="currencyName" value={currencyData.currencyName} />
                <div className="flex justify-center my-[16px]">

                </div>
                <form onSubmit={onCurrencySubmit}>
                    <button className="btn block w-[100%] mt-[8px] bg-orange-500 text-white">확인</button>
                </form>
            </div>

        </>

    )
}