import { useState } from "react";
import FinishBuyModal from "./FinishBuyModal";
import { fetchData } from "@/hooks/swrHooks";
export default function ConfirmItemBuy({ requestData, setRequsetData }) {
    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = fetchData('/api/fetchClassData');
    const { data: studentData, isLoading: isStudentDataLoading, isError: isStudentDataError } = fetchData('/api/fetchStudentData');


    const [isLoading, setIsLoading] = useState(false);
    const { itemData, userData } = requestData;
    const { money, userId, profileName } = userData;
    const [itemId, setItemId] = useState(null);
    const onClick = (e) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/buyItem", {
                method: "POST",
                body: JSON.stringify({ itemData: itemData, userId: userId, balance: money - itemData?.itemPrice }),
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

    if (isClassDataLoading || isStudentDataLoading) return <div>Loading data...</div>;
    if (isClassDataError || isStudentDataError) return <div>Error loading data</div>;

    const { currencyEmoji, currencyName } = classData;
    console.log(userData, itemData)
    const { emoji, itemName, itemExplanation, itemStock, itemPrice } = requestData.itemData;
    return (
        <div className="flex flex-col  justify-center items-center">
            <div className="w-[800px] max-[800px]:w-[90%] min-w-[400px]">
                <div className="text-right text-[1.2rem] mt-[8px]">
                    처음으로
                </div>
                <div className="p-[32px] flex w-full  bg-orange-100 rounded-xl mt-[8px]">
                    <div className="text-[136px] text-center leading-none mr-[32px]">
                        {emoji}
                    </div>
                    <div>
                        <div className="text-[1.6rem]  whitespace-nowrap overflow-hidden text-ellipsis ">
                            {itemName}
                        </div>
                        <div className="text-gray-500 text-[1.4rem] overflow-y-auto mb-[8px]">
                            {itemExplanation}
                        </div>
                        <div className=" flex">
                            <div className="text-[1.2rem]">남은수량: {itemStock}</div>
                        </div>
                        <div className="text-[1.5rem] text-red-500 mt-[8px]">
                            {itemPrice}<span className="ml-[4px]">{currencyName}</span>
                        </div>

                    </div>
                </div>
                <div className="text-[2rem] mt-[128px]">
                    <div className="flex justify-between mb-[16px]">
                        <div>
                            보유 금액
                        </div>
                        <div>
                            {userData.money}
                        </div>
                    </div>
                    <div className="flex justify-between border-b-2 border-gray-300 pb-[8px] mb-[24px]">
                        <div>
                            결제 금액
                        </div>
                        <div>
                            {itemPrice}
                        </div>
                    </div>
                    <div className=" flex justify-between items-center">
                        <div>
                            잔액
                        </div>
                        <div className="text-[3rem] text-orange-500">
                            {userData.money - itemPrice}
                        </div>
                    </div>

                </div>
                <div className="text-[2rem] flex justify-center mt-[64px]">
                    <button className="bg-red-500 text-white rounded-full w-full py-[16px]">결제하기</button>
                </div>
            </div>
            {/* <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200">
            {(money - itemData?.itemPrice) < 0  ? <div><span className="text-red-500 text-[2rem]">잔액이 부족합니다😢 </span></div> : null}
                <div className="flex justify-end">
                    <div className="text-[0.9rem]">{money} {currencyName}</div>
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
                    <div>{money} {currencyName}</div>
                    <div className="mx-[8px]">-</div>
                    <div>{itemData.itemPrice} {currencyName}</div>
                    <div className="mx-[8px]">=</div>
                    <div className={(money - itemData?.itemPrice) < 0 ? 'text-red-500' : `text-green-500`}>{money - itemData?.itemPrice}{currencyName}</div>
                </div>
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    {money - itemData?.itemPrice < 0
                        ? <div className="w-[48%] max-[600px]:w-[100%] opacity-50 ">
                            <button className="cursor-default w-[100%] max-[600px]:w-[100%] bg-orange-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px]">구입</button>
                        </div>
                        : <div onClick={onClick} className="w-[48%] max-[600px]:w-[100%]">
                            <button className="w-[100%] max-[600px]:w-[100%] bg-orange-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px]">구입</button>
                        </div>}

                    <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 rounded-[5px] py-[8px] hover:bg-gray-300 transition-all" onClick={() => setStepData({ menu: 'home', step: null })}>취소</button>
                </div>
            </div> */}
            {/* <FinishBuyModal data={requestData} teacher={teacher} itemId={itemId} /> */}
        </div>
    )
}