'use client'
import { useState } from "react";
import Alert from "../../../components/Alert";
import { useRecoilState } from 'recoil';
import { stepDataState, requestDataState } from '@/store/atoms';

export default function FinishBuyModal({itemId}) {

    const [stepData, setStepData] = useRecoilState(stepDataState)
    const [requestData,setRequestData] = useRecoilState(requestDataState);
    const { itemName, itemPrice} = requestData.itemData;
    const { userId, userName,  teacher } = requestData;
    const [isLoading, setIsLoading] = useState(false);
    const onItemUse = (e) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/useItem", {
                method: "POST",
                // itemName, userId, itemId, teacher, userName, itemPrice
                body: JSON.stringify({ itemName: itemName, userId: userId, teacher: teacher, itemPrice: itemPrice, itemId: itemId, userName: userName}),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    document.getElementById('my_modal_2').showModal()
                } else {
                    setIsLoading(false)
                }
            })
        }

    }

    const onModalFinish = () => {
        location.reload();
    }
    return (
        <dialog id="my_modal_3" className="modal  modal-middle ">
            <div className="modal-box p-0 dark:bg-orange-200 flex flex-col bg-orange-100 max-w-[400px] ">
                <div className=" rounded-xl bg-orange-200 border-0 p-[16px] ">
                    <h1 className="text-[1.6rem]"> <span className="text-red-500 font-bold">{itemName}</span> 아이템을 구입하였습니다</h1>
                    <div className="flex justify-between flex-col">
                        <button className="btn my-[16px] font-bold" onClick={onItemUse}>지금 바로 사용할래요</button>
                        <button className="btn font-bold" onClick={() => location.reload()}>다음에 사용할래요</button>
                    </div>
                </div>
            </div>
            <Alert onModalFinish={onModalFinish} >아이템을 사용하였습니다</Alert>
        </dialog>

    )
}