'use client'
import { useState } from "react";
import Alert from "./Alert";
export default function FinishBuyModal(props) {
    console.log('finish buy modal')
    console.log(props)
    const { itemName, itemPrice, } = props.data.itemData;
    const { userId, userName, userMoney } = props.data;
    const [isLoading, setIsLoading] = useState(false);
    const itemId = props.itemId;
    const { teacher } = props.data;
    const onItemUse = (e) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/useItem", {
                method: "POST",
                // itemName, userId, itemId, teacher, userName, itemPrice
                body: JSON.stringify({ itemName: itemName, userId: userId, teacher: teacher, itemPrice: itemPrice, itemId: itemId, userName: userName, userMoney: userMoney }),
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
    return (
        <dialog id="my_modal_3" className="modal  modal-middle ">
            <div className="modal-box p-0 dark:bg-orange-200 flex flex-col bg-orange-100 max-w-[400px] ">
                <div className=" rounded-xl bg-orange-200 border-0 p-[16px] ">
                    <h1 className="text-[1.6rem]"> <span className="text-red-500 font-bold">{itemName}</span> 아이템을 구입하였습니다</h1>
                    <div className="flex justify-between flex-col">
                        <button className="btn my-[16px] font-bold" onClick={onItemUse}>지금 바로 사용할래요</button>
                        <button className="btn font-bold" onClick={() => props.setStep("home")}>다음에 사용할래요</button>
                    </div>
                </div>
            </div>


            <Alert setStep={props.setStep}>아이템을 사용하였습니다</Alert>
        </dialog>

    )
}