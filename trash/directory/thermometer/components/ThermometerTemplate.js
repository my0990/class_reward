'use client'

import ThermometerObject from "@/app/components/thermometer/ThermometerObject";
import DonationList from "@/app/components/thermometer/donation/DonationList";
import { useState, useRef, useEffect } from 'react';
import Modal from "./Modal";
import HandleThermo from "./HandleThermo";
import Donation from "./Donation";

import { fetchData } from "@/hooks/swrHooks";


export default function ThermometerTemplate({ role }) {
    const { data: thermoData, isLoading: isThermoLoading, isError: isThermoError } = fetchData('/api/fetchThermometerData');
    const { data: userData, isLoading: isUserLoading, isError: isUserError } = fetchData('/api/fetchUserData');
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    const { data: studentData, isLoading: isStudentLoading, isError: isStudentError } = fetchData('/api/fetchStudentData');
    const [rewardObj, setRewardObj] = useState({})
    const [inputWidth, setInputWidth] = useState(Array(11).fill(0));
    const inputMirrorRef = useRef([])
    const [handleThermoType, setHandleThermoType] = useState(null);

    if (isThermoLoading || isUserLoading || isClassLoading || isStudentLoading) return <div>Loading data...</div>;
    if (isThermoError || isUserError || isClassError || isStudentError) return <div>Error loading data</div>;

    const sum = Object.values(thermoData.donators).reduce((acc, value) => acc + value, 0)

    const temp = 23 + ((sum / thermoData.requireCurrency) + thermoData.adjustment) * 3.3;
    const handleThermo = (type) => {
        document.getElementById('handleThermo').showModal()
        setHandleThermoType(type)
    }
    const onDonate = () => {
        if(userData.money <= 0){
            alert('빈털털이입니다')
            return
        }
        document.getElementById('donation').showModal()
    }
    // if(role === "student" && thermoData.isActive !== false){
    //     return(
    //         <div>학급 온도계가 비활성화 되어있습니다.</div>
    //     )
    // }
    const {currencyEmoji, currencyName} = classData;
    return (
        <div className="flex justify-center items-center  flex-col">
            <div className="flex mt-[32px] w-[647px] max-[647px]:w-full  max-[647px]:mt-0 justify-between">
                
                <h1 className="text-[2rem] font-bold text-orange-500">현재 온도:  {((sum / thermoData.requireCurrency) + thermoData.adjustment).toFixed(1)}도</h1>

                {role === 'teacher'
                    ?
                    <div className="flex">
                        <div onClick={() => handleThermo('up')} className="w-[40px] h-[48px] flex items-center justify-center px-[8px] hover:bg-gray-300 cursor-pointer rounded-lg opacity-50 hover:opacity-100 transition-all">
                            <button className="w-[24px] h-[24px]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9.01 9.01 0 0 1-9 9zM8 11V9a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0zm8-2v2a1 1 0 0 1-2 0V9a1 1 0 0 1 2 0zm-8 5h8a4 4 0 0 1-8 0z" /></svg>
                            </button>
                        </div>
                        <div onClick={() => handleThermo("down")} className="w-[40px] h-[48px] flex items-center justify-center px-[8px] hover:bg-gray-300 cursor-pointer rounded-lg opacity-50 hover:opacity-100 transition-all">
                            <button className="w-[24px] h-[24px]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 11V9a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0zm7 1a1 1 0 0 0 1-1V9a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1zm-3 2a6.036 6.036 0 0 0-4.775 2.368 1 1 0 1 0 1.55 1.264 4 4 0 0 1 6.45 0 1 1 0 0 0 1.55-1.264A6.036 6.036 0 0 0 12 14zm11-2A11 11 0 1 1 12 1a11.013 11.013 0 0 1 11 11zm-2 0a9 9 0 1 0-9 9 9.01 9.01 0 0 0 9-9z" /></svg>
                            </button>
                        </div>
                        <button onClick={() => document.getElementById('my_modal_3').showModal()} className="hover:bg-gray-300 px-[8px] rounded-lg bg-white border-0 outline-none opacity-50 hover:opacity-100 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z" /></svg>
                        </button>
                    </div>
                    : <div className="flex items-center">
                        <button onClick={onDonate} className="hover:scale-110 transition-all px-[16px] py-[8px] rounded-lg  border-0 outline-none">
                            <span className="border-b-4 border-orange-400 py-[4px] hover:border-orange-600 ">❤️기부하기</span>
                        </button>
                        <Donation userData={userData} classData={classData} thermoData={thermoData} />
                    </div>}
            </div>

            <div className="bg-orange-200 rounded-2xl pl-[64px] pr-[48px] py-[34px]">
                <div className="flex justify-center items-center flex-wrap">
                    <div className="w-[216px] flex max-[647px]:justify-center">
                        <ThermometerObject reward={thermoData.reward} temp={temp} />
                    </div>
                    <div>
                        <h1 className="text-[1.2rem] font-bold w-auto">기부 순위 <span className="text-red-500">&#40;총 기부 {currencyName} - {Object.values(thermoData.donators).reduce((acc, value) => acc + value, 0)}{currencyEmoji}&#41;</span></h1>
                        <DonationList thermoData={thermoData} currencyName={classData.currencyName} studentData={studentData} />
                    </div>
                </div>
            </div>
            <Modal rewardObj={rewardObj} setRewardObj={setRewardObj} thermoData={thermoData} userData={userData} classData={classData} inputMirrorRef={inputMirrorRef} setInputWidth={setInputWidth} inputWidth={inputWidth} />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((a, i) => {
                return (
                    <div key={i} className="invisible h-0 inline-block px-[8px]" ref={(element) => { inputMirrorRef.current[i] = element; }}>
                        {rewardObj[i * 10]}
                    </div>)
            })}
            <HandleThermo thermoData={thermoData} currencyName={classData.currencyName} type={handleThermoType} />
        </div>
    )

}