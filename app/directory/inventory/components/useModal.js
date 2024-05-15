'use client'
import { useRouter } from "next/navigation";
export default function UseModal({item, userId, teacher, userName}) {
    const router = useRouter();
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/useItem", {
            method: "POST",
            body: JSON.stringify({itemName: item.itemName, userId: userId, itemId: item.itemId, teacher: teacher, userName: userName, itemPrice: item.itemPrice}),
            headers: {
              "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            console.log(data)
            if(data.result === true){
                alert('아이템 사용을 신청하였습니다.')
                

                // const newItemList = itemList.map((a,i)=> a.id === buyList.id ? console.log(a.quantity) : null)

                document.getElementById('my_modal_3').close()

                router.refresh();
            }
        })}
    return (
        <dialog id="my_modal_3" className="modal  modal-middle">
            <div className="modal-box">
                <div className=" flex  p-0 justify-center">
                    <div className="overflow-x-auto w-[512px]">
                        <div className="flex justify-between pb-5">
                            <div className="text-[1.5rem] ">{item?.itemName}</div>
                            <div className="text-red-400  text-[1.5rem]">{item?.itemPrice}원</div>
                        </div>
                        <form onSubmit={onSubmit}>
                            <button className="btn w-full bg-orange-500">사용하기</button>
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