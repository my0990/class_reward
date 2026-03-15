'use client'

import { useState } from "react";


export default function DonationModal({ amount, currencyName, userId, data, money }) {
    const [isLoading, setIsLoading] = useState(false);
    const { teacher } = data

    const onSubmit = (e) => {
        e.preventDefault();
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/setDonation", {
                method: "POST",
                body: JSON.stringify({ amount: Number(parseInt(amount).toFixed(1)), userId: userId, teacher: teacher, money: money }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    alert("등록되었습니다");
                    document.getElementById('my_modal_2').close()
                    setIsLoading(false)
                    location.reload();
                }
            })
        }

    }
    const onClose = () => {
        document.getElementById('my_modal_2').close();
    }




    return (
        <div>
            <dialog id="my_modal_2" className="modal">
                <div className="modal-box bg-orange-200">
                    <h3 className="text-[1.5rem]">
                        {amount}{currencyName}를 기부합니다.
                    </h3>
                    <div className="h-[40px] text-[1.1rem] text-end mt-[8px]">
                        <button onClick={onSubmit} className=" bg-red-500 text-white mr-[8px] h-full rounded-lg px-[16px] hover:bg-red-600" >확인</button>
                        <button onClick={onClose} className=" bg-red-500 text-white mr-[8px] h-full rounded-lg px-[16px] hover:bg-red-600" >취소</button>
                    </div>
                </div>



                <form method="dialog" className="modal-backdrop" onClick={onClose}>
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}