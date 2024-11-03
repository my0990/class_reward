import { useState } from "react";
import FinishBuyModal from "./FinishBuyModal";
import { useRecoilState } from 'recoil';
import { thermometerDataState, userDataState, sessionDataState, stepDataState, requestDataState } from '@/store/atoms';
export default function ConfirmItemBuy({ teacher }) {
    const [requestData, setRequestData] = useRecoilState(requestDataState);
    const [userData, setUserData] = useRecoilState(userDataState);
    const [stepData, setStepData] = useRecoilState(stepDataState);
    const { currencyName, currencyEmoji } = userData.classData;
    const [isLoading, setIsLoading] = useState(false);
    const { itemData, userId, userMoney } = requestData;
    const [itemId, setItemId] = useState(null);
    const onClick = (e) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/buyItem", {
                method: "POST",
                body: JSON.stringify({ itemData: itemData, userId: userId, balance: userMoney - itemData?.itemPrice }),
                headers: {
                    "Content-Type": "application/json"
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    setItemId(data.itemId)
                    document.getElementById('my_modal_3').showModal()
                } else {
                    setIsLoading(false)
                }
            })
        }

    }


    return (
        <div className="flex justify-center items-center h-[100vh]">
            <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200">
            {(userMoney - itemData?.itemPrice) < 0  ? <div><span className="text-red-500 text-[2rem]">잔액이 부족합니다😢 </span></div> : null}
                <div className="flex justify-end">
                    <div className="text-[0.9rem]">{userMoney} {currencyName}</div>
                </div>

                <div className="flex items-center">
                    <div className="text-[1.5rem]">{itemData.emoji}</div>
                    <h1 className="text-[1.5rem] font-bold">{itemData?.itemName}</h1>
                    <div className="mx-[8px]">-</div>
                    <div className="text-[1.1rem] ">{itemData.itemPrice} {currencyName}</div>
                </div>
                <div className="text-gray-500 mb-[32px]">
                    {itemData?.itemExplanation}
                </div>
                <div className="mb-[8px]">남는금액: </div>
                <div className="flex mb-[32px] flex-wrap">
                    <div>{userMoney} {currencyName}</div>
                    <div className="mx-[8px]">-</div>
                    <div>{itemData.itemPrice} {currencyName}</div>
                    <div className="mx-[8px]">=</div>
                    <div className={(userMoney - itemData?.itemPrice) < 0 ? 'text-red-500' : `text-green-500`}>{userMoney - itemData?.itemPrice}{currencyName}</div>
                </div>
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    {userMoney - itemData?.itemPrice < 0
                        ? <div className="w-[48%] max-[600px]:w-[100%] opacity-50 ">
                            <button className="cursor-default w-[100%] max-[600px]:w-[100%] bg-orange-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px]">구입</button>
                        </div>
                        : <div onClick={onClick} className="w-[48%] max-[600px]:w-[100%]">
                            <button className="w-[100%] max-[600px]:w-[100%] bg-orange-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px]">구입</button>
                        </div>}

                    <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 rounded-[5px] py-[8px] hover:bg-gray-300 transition-all" onClick={() => setStepData({ menu: 'home', step: null })}>취소</button>
                </div>
            </div>
            <FinishBuyModal data={requestData} teacher={teacher} itemId={itemId} />
        </div>
    )
}