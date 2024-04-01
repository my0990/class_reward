import { useRouter } from "next/navigation";
export default function BuyModal({buyList, setItemList, itemList, money}) {
    const router = useRouter();
    const onSubmit = (e) => {
        e.preventDefault();
        if(money <= buyList.itemPrice){
            alert('돈이 모자랍니다')
            document.getElementById('my_modal_3').close()
            return
        }
        fetch("/api/buyItem", {
            method: "POST",
            body: JSON.stringify({itemId: buyList.itemId, itemName: buyList.itemName, itemPrice: buyList.itemPrice}),
            headers: {
              "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if(data.result === true){
                alert('구매완료')
                const newItemList = itemList.map((a,i)=> a.itemId === buyList.itemId ? {...a, 'itemQuantity': a.itemQuantity - 1} : a)
                setItemList(newItemList);
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
                            <div className="text-[1.5rem] ">{buyList?.itemName}</div>
                            <div className="text-red-400  text-[1.5rem]">{buyList?.itemPrice}원</div>
                        </div>
                        <form onSubmit={onSubmit}>
                            <button className="btn w-full bg-orange-500">확인</button>
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