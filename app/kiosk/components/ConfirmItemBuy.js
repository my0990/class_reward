import { useState } from "react";
import gold from "@/public/gold.png"
import Image from "next/image";
import Alert from "./Alert";
export default function ConfirmItemBuy({ requestData, setStep, currencyName }) {
    console.log(requestData)
    const [isLoading, setIsLoading] = useState(false);
    const { itemData, userId, userMoney } = requestData;

    const onClick = (e) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/buyItemFromKiosk", {
                method: "POST",
                body: JSON.stringify({ itemData: itemData, userId: userId }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    // alert('구입하였습니다')

                    document.getElementById('my_modal_2').showModal()
                    

                } else {
                    setIsLoading(false)
                }
            })
        }

    }
    return (
        // <div className="h-[100vh] flex justify-center items-center">
        // <div className="border-4 p-[30px] border-red-900 rounded-xl">

        //     <div>{itemData.itemName}</div>
        //     <div>{itemData.itemExplanation}</div>
        //     <div>아이템 가격: {itemData.itemPrice}</div>
        //     <h1 className="text-[2.5rem] mb-[8px]">아이템을 구입하시겠습니까?</h1>
        //     <button className="btn" onClick={onClick}>구입</button>
        //     <button className="btn" onClick={() => location.reload()}>취소</button>
        // </div>
        // </div>
        <div className="flex justify-center items-center h-[100vh]">
            <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200">
                <div className="flex justify-end">
                    {/* <div className="w-[20px] h-[20px] mr-[8px]">
                        <Image src={gold} alt="money" />
                    </div> */}
                    <div className="text-[0.9rem]">{userMoney} {currencyName}</div>
                </div>
                <div className="flex items-center">
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

                    <div className="text-green-500">{userMoney - itemData?.itemPrice} {currencyName}</div>


                </div>
                {/* <div className="mb-[32px]">남은 수량: {itemData?.itemQuantity}</div> */}
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    <div onClick={onClick} className="w-[48%] max-[600px]:w-[100%]">
                        <button className="w-[100%] max-[600px]:w-[100%] bg-orange-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px]">구입</button>
                    </div>
                    <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 rounded-[5px] py-[8px]" onClick={() => setStep('home')}>취소</button>
                </div>
            </div>
            <Alert setStep={setStep} >아이템을 구매하였습니다</Alert>
        </div>
    )
}