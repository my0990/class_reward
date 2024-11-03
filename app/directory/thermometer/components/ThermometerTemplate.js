'use client'

import ThermometerObject from "@/app/components/thermometer/ThermometerObject";
import Donation from "@/app/components/thermometer/donation/Donation";
import { userDataState } from '@/store/atoms';
import { useRecoilState } from "recoil";
import { useState, useRef, useEffect } from 'react';
import DonationModal from "../../../components/thermometer/donation/DonationModal";
import Modal from "../../../components/thermometer/Modal";
import ThermoDec from "./ThermoDec";
import ThermoInc from "./ThermoInc";
export default function ThermometerTemplate({ studentInfo, thermoInfo, role }) {
    const { reward, requireCurrency,} = thermoInfo
    const [isFirstPage, setIsFirstPage] = useState(true);
    const [userData, setUserData] = useRecoilState(userDataState);
    const [width, setWidth] = useState(32);
    const [inputWidth, setInputWidth] = useState(Array(11).fill(0));
    const inputMirrorRef = useRef([])
    const [amount, setAmount] = useState(0);
    const [error, setError] = useState('');
    const mirrorRef = useRef();
    const { userId, money, classData, profileNickname, teacher } = userData;
    const [rewardObj, setRewardObj] = useState(thermoInfo.reward === null ? { 0: '', 10: '', 20: '', 30: '', 40: '', 50: '', 60: '', 70: '', 80: '', 90: '', 100: '' } : thermoInfo.reward)
   
    let adjustment = 0
    if(thermoInfo.adjustment){
        adjustment = thermoInfo.adjustment
    }

    const sum = thermoInfo.donators ? Object.values(thermoInfo.donators).reduce((acc, value) => acc + value, 0) : 0;
    const temp =  23 + ((sum / requireCurrency) + adjustment) * 3.3;


    const onChange = (e) => {
        setWidth(mirrorRef.current.clientWidth);
        // console.log(mirrorRef.current.clientWidth)
        if (e.target.value <= money) {
            setAmount(e.target.value)
        } else {
            setAmount(money)
        }

    }
    const onPrevious = () => {
        setIsFirstPage(true);
        setAmount(0);
        setWidth(32);
        setError('');
    }
    const onModalOpen = () => {
        if (amount > 0) {
            document.getElementById('my_modal_2').showModal()
            setError('')
        } else {
            setError('기부액을 입력해주세요.')
        }

    }
    useEffect(() => {
        if (mirrorRef.current && amount) {
            setWidth(mirrorRef.current.clientWidth);
        }
    }, [amount]);
    useEffect(() => {
        if (rewardObj) {

            setInputWidth((prev) =>
                prev.map((a, i) => { return inputMirrorRef.current[i].clientWidth })
            );

        }
    }, [rewardObj])
    if (isFirstPage) {
        return (
            <div className="flex justify-center items-center  flex-col">
                <div className="flex mt-[32px] w-[647px] max-[647px]:w-full  max-[647px]:mt-0 justify-between">
                    <h1 className="text-[2rem] font-bold text-orange-500">현재온도 - {((sum / requireCurrency) + adjustment).toFixed(1)}도</h1>

                    {role === 'teacher'

                        ?
                        <div className="flex">
                            <div className="w-[40px] h-[48px] flex items-center justify-center px-[8px] hover:bg-gray-300 cursor-pointer rounded-lg opacity-50 hover:opacity-100 transition-all">
                                <button onClick={() => document.getElementById('inc').showModal()} className="w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9.01 9.01 0 0 1-9 9zM8 11V9a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0zm8-2v2a1 1 0 0 1-2 0V9a1 1 0 0 1 2 0zm-8 5h8a4 4 0 0 1-8 0z" /></svg>
                                </button>
                            </div>
                            <div className="w-[40px] h-[48px] flex items-center justify-center px-[8px] hover:bg-gray-300 cursor-pointer rounded-lg opacity-50 hover:opacity-100 transition-all">
                                <button onClick={() => document.getElementById('dec').showModal()} className="w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 11V9a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0zm7 1a1 1 0 0 0 1-1V9a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1zm-3 2a6.036 6.036 0 0 0-4.775 2.368 1 1 0 1 0 1.55 1.264 4 4 0 0 1 6.45 0 1 1 0 0 0 1.55-1.264A6.036 6.036 0 0 0 12 14zm11-2A11 11 0 1 1 12 1a11.013 11.013 0 0 1 11 11zm-2 0a9 9 0 1 0-9 9 9.01 9.01 0 0 0 9-9z" /></svg>
                                </button>
                            </div>
                            <button onClick={() => document.getElementById('my_modal_3').showModal()} className="hover:bg-gray-300 px-[8px] rounded-lg bg-white border-0 outline-none opacity-50 hover:opacity-100 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z" /></svg>
                            </button>
                        </div>
                        : <button onClick={() => setIsFirstPage(false)} className="hover:bg-gray-300 px-[8px] rounded-lg bg-white border-0 outline-none">❤️기부하기</button>}
                </div>
                <div className="bg-orange-200 rounded-2xl pl-[64px] pr-[48px] py-[34px]">
                    <div className="flex justify-center items-center flex-wrap">
                        <div className="w-[216px] flex max-[647px]:justify-center">
                            <ThermometerObject reward={reward} temp={temp} />
                        </div>
                        <div>
                            <h1 className="text-[1.2rem] font-bold w-auto">기부 천사 순위</h1>
                            <Donation studentInfo={studentInfo} thermoInfo={thermoInfo} />
                        </div>
                    </div>
                </div>
                <Modal thermoInfo={thermoInfo} rewardObj={rewardObj} setRewardObj={setRewardObj} width={inputWidth} setWidth={setInputWidth} />
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((a, i) => {
                    return <div key={i} className="invisible h-0 inline-block px-[8px]" ref={(element) => {
                        inputMirrorRef.current[i] = element;
                    }}>{rewardObj[i * 10]}</div>
                })}
                <ThermoDec thermoInfo={thermoInfo} currencyName= {classData.currencyName} userId={userId}/>
                <ThermoInc thermoInfo={thermoInfo} currencyName= {classData.currencyName} userId={userId}/>
            </div>
        )
    } else {

        return (
            <div className="flex justify-center flex-col items-center text-[1.5rem]">
                <div className="bg-orange-200 w-[400px]  p-[32px] rounded-lg mt-[32px]">
                    <div className="flex justify-between ">
                        <div>{profileNickname + '(' + userId + ')'}</div>
                        <div>{classData.currencyEmoji} {money}</div>
                    </div>
                    <div className="mt-[16px] flex justify-end">
                        <input type="number" className="max-w-[200px] border-b-2 border-black px-[8px] min-w-[32px] outline-none bg-orange-200" style={{ width: width + 'px' }} onChange={onChange} value={amount === 0 ? null : amount} />{classData.currencyName} 기부하기
                    </div>
                    <div className="mt-[16px]">
                        <div > <span className="text-red-500 font-semibold">{(amount / requireCurrency).toFixed(1)}도 </span>상승</div>
                    </div>
                    <div className="flex justify-center">
                        <button onClick={onModalOpen} className="bg-red-500 rounded-lg mr-[8px] px-[16px] py-[8px] w-full mt-[16px] hover:bg-red-400 text-[1rem] text-white">확인</button>
                        <button onClick={onPrevious} className="bg-gray-500 rounded-lg px-[16px] py-[8px] w-full mt-[16px] hover:bg-gray-400 text-[1rem] text-white">뒤로가기</button>
                    </div>
                    <div className="text-center text-red-500 text-[1.2rem] mt-[8px]">{error}</div>
                </div>
                <div className="invisible h-0 inline-block px-[8px]" ref={mirrorRef}>{amount}</div>
                <DonationModal amount={amount} userId={userId} currencyName={classData.currencyName} teahcer={teacher} data={data} money={money} />
            </div>
        )
    }
}