import { useRouter } from "next/navigation";
export default function BuyModal({buyList, setItemList, itemList}) {
    const router = useRouter();
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/buyItem", {
            method: "POST",
            body: JSON.stringify({id: buyList.id, name: buyList.name, price: buyList.price}),
            headers: {
              "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            console.log(data.result)
            if(data.result === true){
                // alert('구매완료')
                
                const newItemList = itemList.map((a,i)=> a.id === buyList.id ? {...a, 'quantity': a.quantity - 1} : a)
                // const newItemList = itemList.map((a,i)=> a.id === buyList.id ? console.log(a.quantity) : null)
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
                            <div className="text-[1.5rem] ">자리바꾸기</div>
                            <div className="text-red-400  text-[1.5rem]">3000원</div>
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