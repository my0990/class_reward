'use client'
import { useState, useRef, useEffect } from "react";
import Scale from "@/app/components/thermometer/Scale";
import Degree from "@/app/components/thermometer/Degree";
import { mutate } from "swr";


export default function Modal({ thermoData, classData, inputMirrorRef, setInputWidth, inputWidth, rewardObj, setRewardObj }) {

    const [isFirstStep, setIsFirstStep] = useState(true);
    const { currencyEmoji, currencyName } = classData;

    const [requireCurrency, setRequireCurrency] = useState(0);

    useEffect(() => {
        if (thermoData) {
            setRequireCurrency(thermoData.requireCurrency)
            setRewardObj(thermoData.reward);
        }
    }, [thermoData])

    useEffect(() => {
        if (inputMirrorRef) {
            console.log('input changed')
            setInputWidth((prev) =>
                prev.map((a, i) => { return inputMirrorRef?.current[i]?.clientWidth })
            );

        }
    }, [rewardObj])

    let tmp = []
    let start = 95;
    for (let index = 0; index < 11; index++) {

        tmp.push(start)
        start += 33
    }



    const onRewardChange = (e, key) => {
        setRewardObj((prev) => ({
            ...prev,
            [key]: e.target.value
        }))
        // console.log(rewardObj)
    }

    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/setThermometer", {
            method: "POST",
            body: JSON.stringify({ rewardObj: rewardObj, requireCurrency: requireCurrency }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {

            if (data.result === true) {

                mutate(
                    "/api/fetchThermometerData",
                    (prev) => {
                        return { ...prev, requireCurrency: requireCurrency, reward:  rewardObj}


                    },
                    false // 서버 요청 없이 즉시 반영
                );

            }
            document.getElementById('my_modal_3').close()
        })
    }
    const onClose = () => {
        if (thermoData) {
            setRequireCurrency(thermoData.requireCurrency);
            setRewardObj(thermoData.reward);
        }
        document.getElementById('my_modal_3').close();
        setIsFirstStep(true);


    }
    const onPrev = () => {
        setIsFirstStep(true);

    }
    const onNextClick = (e) => {
        if (requireCurrency === 0) {
            alert('숫자를 입력해주세요')
            return
        }
        setIsFirstStep(false)
    }



    return (
        <div>
            <dialog id="my_modal_3" className="modal">
                {isFirstStep
                    ? <div className="modal-box bg-orange-200 overflow-hidden">
                        <h3 className="text-[1.5rem]">
                            학급온도계 1도를 올리기 위해 필요한 학급 화폐
                        </h3>

                        <div className="flex relative mt-[16px] h-[40px]">
                            <input value={requireCurrency === 0 ? '' : requireCurrency} type="number" onChange={(e) => setRequireCurrency(parseInt(e.target.value))} className="border-2 pl-[32px] h-full rounded-lg border-orange-300 outline-none focus:border-orange-500 text-right w-[100px] pr-[8px] mr-[8px]" ></input>
                            <div className="h-full text-[1.5rem]">{currencyName}</div>
                            <div className="absolute top-[8px] left-[8px]">{currencyEmoji}</div>
                        </div>
                        <div className="h-[40px] text-end mt-[8px]">
                            <button className=" bg-red-500 text-white mr-[8px] h-full rounded-lg px-[16px] hover:bg-red-600  " onClick={onNextClick}>다음</button>
                        </div>
                    </div>

                    : <div className="modal-box bg-orange-200 overflow-x-auto overflow-y-hidden">
                        <h3 className="text-[1.5rem]">
                            학급온도계 보상 입력
                        </h3>
                        <div className="flex justify-center">
                            <div className="flex w-[120px] justify-center items-center flex-col  relative h-[450px] ">
                                <div className="w-[60px] h-[450px] overflow-hidden bg-white border-8 border-white rounded-full  absolute flex justify-center">
                                    <div className="w-[48px] h-[424px]  bg-red-500  absolute z-10 bottom-20"></div>
                                </div>
                                <div className="w-[100px] h-[100px] bg-red-500 rounded-full absolute bottom-2 z-10"></div>
                                <div className="w-[116px] h-[116px] bg-white rounded-full absolute bottom-0"></div>
                                {tmp.map((a, i) => {
                                    if (i !== 10) {
                                        return (
                                            <Scale degree={a} key={i} />
                                        )
                                    }
                                })}
                                {tmp.map((a, i) => {
                                    return (
                                        <Degree degree={a} temp={i} key={i} />
                                    )
                                })}
                                {tmp.map((a, i) => {
                                    return (
                                        <div key={i} className={`flex absolute h-[30px] left-[100px] z-50 overflow-hidden items-center cursor-default hover:scale-110 transition-all ${rewardObj[i * 10] === '' ? "opacity-50" : null} hover:opacity-100 focus-within:opacity-100`} style={{ bottom: a + 'px' }}>
                                            <div className="w-0 h-0 " style={{ borderTop: "12px solid transparent", borderRight: "16px solid rgb(251 146 60)", borderBottom: "12px solid transparent" }}></div>
                                            <div className="h-[24px]  z-50  w-fit " >
                                                <input key={i} value={rewardObj[i * 10]} onChange={(e) => { onRewardChange(e, i * 10) }} className="bg-orange-400 px-[8px] min-w-[60px]  outline-none" style={{ width: inputWidth[i] + 'px' }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="h-[40px] flex justify-between mt-[8px]">
                            <button className=" bg-red-500 text-white mr-[8px] h-full rounded-lg px-[16px] hover:bg-red-600  " onClick={onPrev}>이전</button>
                            <button className=" bg-green-500 text-white mr-[8px] h-full rounded-lg px-[16px] hover:bg-red-600  " onClick={onSubmit}>확인</button>

                        </div>

                    </div>}

                <form method="dialog" className="modal-backdrop" onClick={onClose}>
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}