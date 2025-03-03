
import { fetchData } from "@/hooks/swrHooks";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ConfirmModal from "./ConfirmModal";
import { useRouter } from "next/navigation";
export default function ThermometerDonation({ requestData }) {
    const { data: thermoData, isLoading: isThermoLoading, isError: isThermoError } = fetchData('/api/fetchThermometerData');

    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');


    const route = useRouter();
    const [amount, setAmount] = useState(0);
    const mirrorRef = useRef();

    const [error, setError] = useState('');
    const [width, setWidth] = useState(32);
    const [isLoading, setIsLoading] = useState(false);
    const { userId, money, profileNickname, teacher } = requestData.userData;

    const onChange = (e) => {
        setWidth(mirrorRef.current.clientWidth);
        if (/^\d*$/.test(e.target.value)) {

            if (e.target.value < money) {
                console.log(e.target.value)

                setAmount(e.target.value)
            } else {
                setAmount(money)
            }
        }
    }

    const onSubmit = (e) => {
        e.preventDefault();
        console.log(typeof (amount))
        if(isNaN(Number(parseInt(amount).toFixed(1))) || Number(amount) === 0){
            setError('입력값을 확인해주세요')
            return;
        }
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/setDonation", {
                method: "POST",
                body: JSON.stringify({ amount: Number(parseInt(amount).toFixed(1)), userId: userId, money: money }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    alert(`${Number(parseInt(amount).toFixed(1))}${currencyName}을/를 기부하였습니다`)
                    setIsLoading(false)
                    route.push('/kiosk')
                }
            })
        }

    }
    useEffect(() => {
        if (mirrorRef.current && amount) {
            setWidth(mirrorRef.current.clientWidth);
        }
    }, [amount]);


    if (isThermoLoading || isClassLoading) return <div>Loading data...</div>;
    if (isThermoError || isClassError) return <div>Error loading data</div>;
    const { currencyName, currencyEmoji } = classData;
    const { userData } = requestData;
    return (


        <div className="flex  justify-center min-h-[100vh] py-[32px]">
            <div className="flex flex-col justify-between w-[800px] max-[800px]:w-[90%] min-w-[400px]">
                <div className="flex justify-between items-center">
                    <div className="text-[2rem] text-orange-400">
                        {userData.profileNickname} &#40;{userData.userId}&#41;
                    </div>
                    <div className="text-right text-[1.2rem] flex justify-end">
                        <Link href="/kiosk">
                            <div className="cursor-pointer text-[2rem] transition-all  hover:scale-110">
                                처음으로
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="text-[1.8rem] mt-[64px]">
                    <div className="flex justify-between mb-[16px]">
                        <div>
                            보유 금액
                        </div>
                        <div>
                            {userData.money} {currencyName}
                        </div>
                    </div>
                    <div className="invisible cursor-default h-0 inline-block px-[8px] absolute" ref={mirrorRef}>{amount}</div>
                    <div className="flex justify-between  ">
                        <div>
                            기부 금액
                        </div>
                        <div>
                            <input autoFocus type="number" className="text-rightn max-w-[200px] border-b-2 border-black px-[8px] min-w-[32px] outline-none bg-orange-200" style={{ width: width + 'px' }} onChange={onChange} value={money === 0 ? 0 : amount <= 0 ? "" : amount} /> {classData.currencyName}

                        </div>
                    </div>
                    <div className="border-b-2 border-gray-300 pb-[16px] mb-[8px] text-orange-500 text-[1.2rem] text-right" >
                        약 {(Number(amount) / parseInt(thermoData.requireCurrency)).toFixed(1)}도 상승
                    </div>
                    <div className=" flex justify-between items-center">
                        <div>
                            잔액
                        </div>
                        <div className="text-[3rem] text-orange-500">
                            {userData.money - amount} {currencyName}
                        </div>
                    </div>

                </div>

                <div className="text-[1.8rem] flex-col items-center flex justify-center mt-[64px] ">
                    <div className="text-[1.2rem] text-red-500 mb-[8px] h-[30px]">
                        {error}
                    </div>
                    <button onClick={onSubmit} className="bg-red-500 text-white rounded-full w-full py-[16px] hover:scale-105 transition-all">기부하기</button>
                </div>
            </div>
            <ConfirmModal />
        </div>
    )
}