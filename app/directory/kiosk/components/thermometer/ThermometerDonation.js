import DonationModal from "@/app/components/thermometer/donation/DonationModal";
import { userDataState, thermometerDataState, stepDataState, requestDataState, studentDataState } from '@/store/atoms';
import { useRecoilState } from "recoil";
import { useState, useEffect, useRef } from "react";
export default function ThermometerDonation() {
    const [amount, setAmount] = useState(0);
    const mirrorRef = useRef();

    const [error, setError] = useState('');
    const [width, setWidth] = useState(32);
    const [userData, setUserData] = useRecoilState(userDataState);
    const [thermometerData, setThermometerData] = useRecoilState(thermometerDataState);
    const [stepData,setStepData] = useRecoilState(stepDataState);
    const [requestData,setRequestData] = useRecoilState(requestDataState);
    const { userId, userMoney,  userNickname, teacher } = requestData;
    const {classData} = userData;

    const onChange = (e) => {
        setWidth(mirrorRef.current.clientWidth);
        if (e.target.value < userMoney) {
            console.log(e.target.value)
            
            setAmount(e.target.value)
        } else {
            setAmount(userMoney)
        }

    }
    const onPrevious = () => {
        setStepData({menu:"thermometer", step:"thermometerBoard"})
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
    return (
        <div className="flex justify-center flex-col items-center text-[1.5rem]">
            <div className="bg-orange-200 w-[400px]  p-[32px] rounded-lg mt-[32px]">
                <div className="flex justify-between ">
                    <div>{userNickname + '(' + userId + ')'}</div>
                    <div>{classData.currencyEmoji} {userMoney}</div>
                </div>
                <div className="mt-[16px] flex justify-end">
                    <input type="number" className="max-w-[200px] border-b-2 border-black px-[8px] min-w-[32px] outline-none bg-orange-200" style={{ width: width + 'px' }} onChange={onChange} value={userMoney === 0 ? 0 : amount === 0 ? "" : amount} />{classData.currencyName} 기부하기
                </div>
                <div className="mt-[16px]">
                    <div > <span className="text-red-500 font-semibold">{(parseInt(amount) / parseInt(thermometerData.requireCurrency)).toFixed(1)}도 </span>상승</div>
                </div>
                <div className="flex justify-center">
                    <button onClick={onModalOpen} className="bg-red-500 rounded-lg mr-[8px] px-[16px] py-[8px] w-full mt-[16px] hover:bg-red-400 text-[1rem] text-white">확인</button>
                    <button onClick={onPrevious} className="bg-gray-500 rounded-lg px-[16px] py-[8px] w-full mt-[16px] hover:bg-gray-400 text-[1rem] text-white">뒤로가기</button>
                </div>
                <div className="text-center text-red-500 text-[1.2rem] mt-[8px]">{error}</div>
            </div>
            <div className="invisible h-0 inline-block px-[8px]" ref={mirrorRef}>{amount}</div>
            <DonationModal amount={amount} userId={userId} currencyName={classData.currencyName} teahcer={teacher} data={requestData} money={requestData.userMoney}/>
        </div>
    )
}