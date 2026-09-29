import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { useItem } from "@/server-action/actions/item/item.action";
export default function ConfirmItemUse({ itemData, userData, classId }) {


    const [isLoading, setIsLoading] = useState(false);
    const onClose = () => {
        document.getElementById('confirmModal').close();
    }
    const route = useRouter();
    console.log(itemData, userData)
    const onSubmit = (data) => {

        const { itemName, itemId } = itemData;
        const { userId, money } = userData;

        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            useItem({ itemName, userId, itemId, classId }).then((data) => {

                if (data?.result === true) {
                    alert('아이템을 사용하였습니다')
                } else {
                    alert(data?.message || '아이템 사용에 실패했습니다.');
                }
                mutate(
                    `/api/students/${classId}`,
                );
                route.push(`/teacher/kiosk/${classId}`);
                setIsLoading(false);
            }).catch((error) => {
                console.error(error);
                alert('네트워크 오류가 발생했습니다.');
                setIsLoading(false);
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