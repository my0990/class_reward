import { useState } from "react";
import gold from "@/public/gold.png"
import Image from "next/image";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Alert from "./Alert";
export default function ConfirmItemUse({ requestData, setStep }) {
    console.log(requestData)
    const MySwal = withReactContent(Swal)
    
    const [isLoading, setIsLoading] = useState(false);
    const { userName, userId, userMoney } = requestData;
    const {itemId,itemName,itemPrice,teacher, itemExplanation} = requestData.itemData;
    console.log(requestData)
    const onClick = (e) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/useItem", {
                method: "POST",
                // itemName, userId, itemId, teacher, userName, itemPrice
                body: JSON.stringify({ itemName: itemName, userId: userId, teacher: teacher, itemPrice: itemPrice, itemId: itemId, userName: userName }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    document.getElementById('my_modal_2').showModal()
                    location.reload();


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
                    <div className="w-[20px] h-[20px] mr-[8px]">
                        <Image src={gold} alt="money" />
                    </div>
                    <div className="text-[0.9rem]">{userMoney}원</div>
                </div>
                <div className="flex items-center">
                    <h1 className="text-[1.5rem] font-bold">{itemName}</h1>
                    <div className="mx-[8px]">-</div>
                    <div className="text-[1.1rem] ">{itemPrice}원</div>
                </div>
                <div className="text-gray-500 mb-[32px]">
                    {itemExplanation}
                </div>
                {/* <div className="mb-[32px]">남은 수량: {itemData?.itemQuantity}</div> */}
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    <div onClick={onClick} className="w-[48%] max-[600px]:w-[100%]">
                <button className="w-[100%] max-[600px]:w-[100%] bg-orange-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px]">사용</button>
            </div>
                    <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 rounded-[5px] py-[8px]" onClick={() => document.getElementById('my_modal_3').close()}>취소</button>
                </div>
            </div>
            <Alert setStep={setStep}/>
        </div>
    )
}