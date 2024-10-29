'use client'

import ThermometerObject from "@/app/components/thermometer/ThermometerObject";
import Donation from "@/app/components/thermometer/donation/Donation";
import { userDataState, thermometerDataState, stepDataState, requestDataState, studentDataState } from '@/store/atoms';
import { useRecoilState } from "recoil";
import { useState, useRef, useEffect } from 'react';

import Modal from "@/app/components/thermometer/Modal";

export default function ThermometerBoard() {
    const [thermometerData, setThermometerData] = useRecoilState(thermometerDataState)
    const [page, setPage] = useState(1);
    const [userData, setUserData] = useRecoilState(userDataState);
    const [stepData, setStepData] = useRecoilState(stepDataState);
    const [requestData, setRequestData] = useRecoilState(requestDataState);
    const [studentData, setStudentData] = useRecoilState(studentDataState);

    const [inputWidth, setInputWidth] = useState(Array(11).fill(0));
    const inputMirrorRef = useRef([])



    const { userId, money, classData, profileNickname, teacher } = userData;
    const [rewardObj, setRewardObj] = useState(thermometerData.reward)
    const sum = thermometerData.donators ? Object.values(thermometerData.donators).reduce((acc, value) => acc + value, 0) : 0;
    const temp = 23 + (sum / thermometerData.requireCurrency) * 3.3;


    const { step } = stepData;


    useEffect(() => {
        if (rewardObj) {

            setInputWidth((prev) =>
                prev.map((a, i) => { return inputMirrorRef.current[i].clientWidth })
            );

        }
    }, [rewardObj])

    if (step === "thermometerBoard") {
        return (
            <div className="flex justify-center items-center  flex-col">
                <div className="flex mt-[32px] w-[647px] max-[647px]:w-full  max-[647px]:mt-0 justify-between">
                    <div className="flex cursor-pointer hover:scale-110 transition-all" onClick={() => setStepData({menu:'home',step:null})}>
                        <div className="h-[48px] w-[24px] flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                        </div>
                        <div className="flex items-center text-[2rem]">이전</div>
                    </div>
                    <h1 className="text-[2rem] font-bold text-orange-500 ">현재온도 - {(sum / thermometerData.requireCurrency).toFixed(1)}도</h1>
                    <button onClick={() => setStepData({ menu: "thermometer", step: "thermometerCharacterPick" })} className="hover:scale-110 transition-all  px-[8px] rounded-lg border-0 outline-none">❤️기부하기</button>
                </div>
                <div className="bg-orange-200 rounded-2xl pl-[64px] pr-[48px] py-[34px] ">
                    <div className="flex justify-center items-center flex-wrap">
                        <div className="w-[216px] flex max-[647px]:justify-center">
                            <ThermometerObject reward={thermometerData.reward} temp={temp} />
                        </div>
                        <div>
                            <h1 className="text-[1.2rem] font-bold w-auto">기부 천사 순위</h1>
                            <Donation studentInfo={studentData} thermoInfo={thermometerData} />
                        </div>
                    </div>
                </div>
                <Modal thermoInfo={thermometerData} rewardObj={rewardObj} setRewardObj={setRewardObj} width={inputWidth} setWidth={setInputWidth} />
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((a, i) => {
                    return <div key={i} className="invisible h-0 inline-block px-[8px]" ref={(element) => {
                        inputMirrorRef.current[i] = element;
                    }}>{rewardObj[i * 10]}</div>
                })}

            </div>
        )
    }
}

