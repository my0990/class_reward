'use client'
import { useState } from "react";


export default function ProfileSetModal({ modalData, setModalData, setUrl, url }) {
    const onPriceChange = (e) => {
        setModalData((prev) => ({ ...prev, price: e.target.value }));
    }
    const toggleActive = (e) => {
        setModalData((prev) => ({ ...prev, isActive: e.target.checked }));
    }
    const onCloseModal = () => {
        setModalData({ isActive: false, price: 0 })
        document.getElementById('profileSet').close()
    }


    const [isLoading, setIsLoading] = useState(false);
    const onSubmit = (e) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/setProfileImg", {
                method: "POST",
                body: JSON.stringify({ data: modalData }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    document.getElementById('profileSet').close()
                    setUrl((prev) => ({ ...prev, [modalData.urlId]: { ...url[modalData.urlId], isActive: modalData.isActive, price: modalData.price, } }))
                } else {
                    alert('잔액이 부족합니다')
                }
                setIsLoading(false)
            },
            )
        }

    }

    return (
        <dialog id="profileSet" className="modal  modal-middle ">
            <div className="modal-box p-[24px] dark:bg-orange-200 flex flex-col bg-orange-100 max-w-[320px] ">
                <div className="flex justify-between mb-[32px]">
                    <div>공개</div>
                    <div><input onChange={toggleActive} type="checkbox" checked={modalData.isActive} className="toggle toggle-success" /></div>
                </div>
                <div className="flex justify-between mb-[32px]">
                    <div>가격</div>
                    <div>
                        <input value={modalData.price || ''} onChange={onPriceChange} className="text-right bg-orange-100 border-b-2 border-black w-[100px] outline-none"></input><span>쿠키</span>
                    </div>
                </div>
                <div className="flex justify-between">
                    <button onClick={onSubmit} className=" bg-orange-500 text-white py-[8px] hover:bg-orange-600 w-[120px] px-[24px] rounded-lg">확인</button>
                    <button onClick={onCloseModal} className=" text-gray-700 py-[8px] px-[24px] hover:bg-gray-300 w-[120px] rounded-lg bg-white-100">취소</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
                <button>close</button>
            </form>
        </dialog>

    )
}