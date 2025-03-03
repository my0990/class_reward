import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmItemUse({itemData, userData}) {
    
    
    const [isLoading, setIsLoading] = useState(false);
    const onClose = () => {
        document.getElementById('confirmModal').close();
    }
    const route = useRouter();
    const onSubmit = (data) => {

        const { itemName, itemId } = itemData;
        const { userId, money } = userData;

        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/useItem", {
                method: "POST",
                // itemName, userId, itemId, teacher, userName, itemPrice
                body: JSON.stringify({ itemName: itemName, userId: userId, balance: money, itemId: itemId }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    alert('아이템을 사용하였습니다')
                    route.push('/kiosk')
                }
                setIsLoading(false)
            })
        }

    }
    return (
        <dialog id="confirmModal" className="modal  modal-middle ">
            <div className="modal-box p-0 dark:bg-orange-200 p-[32px] flex flex-col bg-orange-100 max-w-[600px] ">
                <div className=" rounded-xl bg-orange-100 border-0 p-[16px] ">
                    <h1 className="text-[2rem]">아이템을 사용하시겠습니까?</h1>
                    <div className="flex justify-between flex-col mt-[16px]">
                        <button onClick={onSubmit} className="bg-orange-500  rounded-lg font-semibold hover:text-white transition-all text-black my-[16px] py-[16px] text-[1.4rem]" >확인</button>
                        <button onClick={onClose} className="bg-red-500  rounded-lg font-semibold hover:text-white transition-all text-black py-[16px] text-[1.4rem]" >취소</button>
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    )
}