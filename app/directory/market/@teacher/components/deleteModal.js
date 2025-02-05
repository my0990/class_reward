import { useEffect, useState } from "react";
import { mutate } from "swr";
export default function DeleteModal({ pickedItem, currencyName }) {
    const [isLoading, setIsLoading] = useState(false);
    const onSubmit = (e) => {
        e.preventDefault();
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/deleteItem", {
                method: "POST",
                body: JSON.stringify({ itemId: pickedItem.itemId }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    alert('성공했습니다.');
                    setIsLoading(false);
                    mutate('/api/fetchClassData');
                    document.getElementById('delete').close();
                }
            })
        }

    }

    if (!pickedItem) {
        return (
            <dialog id="delete" className="modal  modal-middle">
                <div></div>
            </dialog>
        )
    }
    return (
        <dialog id="delete" className="modal  modal-middle">
            <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200">
                <div className="flex items-center mb-[8px]">
                    <h1 className="text-[1.5rem] font-bold outline-none" tabIndex={99}>{pickedItem.itemName}</h1>
                    <div className="mx-[8px]">-</div>
                    <div className="text-[1.1rem] ">{pickedItem.itemPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyName}</div>
                </div>
                <div>
                    <div className="text-[160px] leading-none text-center my-[32px]">{pickedItem.emoji}</div>
                </div>
                <div className="text-gray-500 mb-[8px]">
                    {pickedItem.itemExplanation}
                </div>
                <div className="mb-[32px]">남은 수량: {pickedItem.itemStock}</div>
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    <form onSubmit={onSubmit} className="w-[48%] max-[600px]:w-[100%]">
                        <button className="w-[100%] max-[600px]:w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px] hover:bg-red-500">삭제</button>
                    </form>
                    <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 hover:bg-gray-300 rounded-[5px] py-[8px]" onClick={() => document.getElementById('delete').close()}>취소</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>

        </dialog>

    )
}