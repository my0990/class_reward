import { useState } from "react";
import FinishBuyModal from "./FinishBuyModal";
import { fetchData } from "@/hooks/swrHooks";
import Link from "next/link";

export default function ConfirmItemBuy({ requestData, setRequestData }) {

    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = fetchData('/api/fetchClassData');
    const { data: studentData, isLoading: isStudentDataLoading, isError: isStudentDataError } = fetchData('/api/fetchStudentData');


    const [isLoading, setIsLoading] = useState(false);
    const { itemData, userData } = requestData;
    const { money, userId, profileName } = userData;
    const [fetchItemId, setFetchItemId] = useState();

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
                    document.getElementById('finishModal').showModal();

                    setFetchItemId(data.itemId)
                } else {
                    setIsLoading(false)
                }
            })
        }

    }

    if (isClassDataLoading || isStudentDataLoading) return <div>Loading data...</div>;
    if (isClassDataError || isStudentDataError) return <div>Error loading data</div>;

    const { currencyEmoji, currencyName } = classData;

    const { emoji, itemName, itemExplanation, itemStock, itemPrice } = requestData.itemData;
    return (
        <div className="flex  justify-center min-h-[100vh] py-[32px]">
            <div className="flex flex-col justify-between w-[800px] max-[800px]:w-[90%] min-w-[400px]">
                <div className="flex justify-between">
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
                <div className="text-[1.8rem] mt-[64px]">
                    <div className="flex justify-between mb-[16px]">
                        <div>
                            보유 금액
                        </div>
                        <div>
                            {userData.money} {currencyName}
                        </div>
                    </div>
                    <div className="flex justify-between border-b-2 border-gray-300 pb-[8px] mb-[24px]">
                        <div>
                            결제 금액
                        </div>
                        <div>
                            - {itemPrice} {currencyName}
                        </div>
                    </div>
                    <div className=" flex justify-between items-center">
                        <div>
                            잔액
                        </div>
                        <div className="text-[3rem] text-orange-500">
                            {userData.money - itemPrice} {currencyName}
                        </div>
                    </div>

                </div>
                <div className="text-[1.8rem] flex justify-center mt-[64px] hover:scale-105 transition-all">
                    <button onClick={onClick} className="bg-red-500 text-white rounded-full w-full py-[16px]">결제하기</button>
                </div>
            </div>
            <FinishBuyModal requestData={requestData} fetchItemId={fetchItemId} />
        </div>
    )
}