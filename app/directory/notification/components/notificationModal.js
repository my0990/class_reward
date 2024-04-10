'use client'
import { useRouter } from "next/navigation";
export default function NotificationModal({item, userId}) {
    const router = useRouter();
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/approveItem", {
            method: "POST",
            body: JSON.stringify({userId: item.userId, itemId: item.itemId, teacher: userId}),
            headers: {
              "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            console.log(data)
            if(data.result === true){
                alert('승인하였습니다.')
                

                // const newItemList = itemList.map((a,i)=> a.id === buyList.id ? console.log(a.quantity) : null)

                document.getElementById('my_modal_3').close()

                router.refresh();
            }
        })}
    return (
        <dialog id="my_modal_3" className="modal sm:modal-bottom modal-middle">
            <div className="modal-box">
                <div className=" flex  p-0 justify-center">
                    <div className="overflow-x-auto w-[512px]">
                        <div className="flex justify-between pb-5">
                            <div className="text-[1.5rem] ">{item?.itemName}</div>
                            <div className="text-red-400  text-[1.5rem]">{item?.itemPrice}원</div>
                        </div>
                        <form onSubmit={onSubmit}>
                            <button className="btn w-full bg-orange-500">승인하기</button>
                        </form>
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

    )
}