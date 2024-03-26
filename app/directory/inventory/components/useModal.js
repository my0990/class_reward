'use client'
import { useRouter } from "next/navigation";
export default function UseModal({item, user, teacher}) {
    const router = useRouter();
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/useItem", {
            method: "POST",
            body: JSON.stringify({name: item.name, user: user, itemId: item.itemId, teacher: teacher}),
            headers: {
              "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            console.log(data)
            if(data.result === true){
                // alert('구매완료')
                

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
                            <div className="text-[1.5rem] ">자리바꾸기</div>
                            <div className="text-red-400  text-[1.5rem]">3000원</div>
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