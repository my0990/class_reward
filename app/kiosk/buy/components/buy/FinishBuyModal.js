'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function FinishBuyModal({requestData, fetchItemId}) {
    const { itemName, itemPrice} = requestData.itemData;
    const { userId, money} = requestData.userData;
    const [isLoading, setIsLoading] = useState(false);
    const route = useRouter();
    const onItemUse = (e) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/useItem", {
                method: "POST",
                // itemName, userId, itemId, teacher, userName, itemPrice
                body: JSON.stringify({ itemName: itemName, userId: userId,  balance: money - itemPrice, itemId: fetchItemId}),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    alert('아이템을 사용하였습니다');
                    route.push('/kiosk')
                } else {
                    setIsLoading(false)
                }
            })
        }

    }

    return (
        <dialog id="finishModal" className="modal  modal-middle ">
            <div className="modal-box p-0 dark:bg-orange-200 p-[32px] flex flex-col bg-orange-100 max-w-[600px] ">
                <div className=" rounded-xl bg-orange-100 border-0 p-[16px] ">
                    <h1 className="text-[2rem]"> <span className="text-red-500 font-bold">{itemName}</span> 아이템을 구입하였습니다</h1>
                    <div className="flex justify-between flex-col mt-[16px]">
                        <button className="bg-orange-500  rounded-lg font-semibold hover:text-white transition-all text-black my-[16px] py-[16px] text-[1.4rem]" onClick={onItemUse}>지금 바로 사용할래요</button>
                        <button className="bg-red-500  rounded-lg font-semibold hover:text-white transition-all text-black py-[16px] text-[1.4rem]" onClick={() => route.push('/kiosk')}>다음에 사용할래요</button>
                    </div>
                </div>
            </div>

        </dialog>

    )
}