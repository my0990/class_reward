import { useRouter } from "next/navigation";
import gold from "@/public/gold.png";
import Image from "next/image";
export default function BuyModal({ buyList, setItemList, itemList, money }) {
    const router = useRouter();
    const onSubmit = (e) => {
        e.preventDefault();
        if (money < buyList.itemPrice) {
            alert('돈이 모자랍니다')
            document.getElementById('my_modal_3').close()
            return
        }
        fetch("/api/buyItem", {
            method: "POST",
            body: JSON.stringify({ itemId: buyList.itemId, itemName: buyList.itemName, itemPrice: buyList.itemPrice }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
                alert('구매완료')
                const newItemList = itemList.map((a, i) => a.itemId === buyList.itemId ? { ...a, 'itemQuantity': a.itemQuantity - 1 } : a)
                setItemList(newItemList);
                document.getElementById('my_modal_3').close()
                router.refresh();
            }
        })
    }


    const itemPrice = buyList?.itemPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    const currentMoney = money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    const left = (money - buyList?.itemPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return (
        <dialog id="my_modal_3" className="modal  modal-middle ">
            {/* <div className="modal-box">
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
            </div> */}
            <div className="modal-box min-[600px]:p-[48px]">
                <div className="flex justify-end">
                    <div className="w-[20px] h-[20px] mr-[8px]">
                        <Image src={gold} />
                    </div>
                    <div className="text-[0.9rem]">{currentMoney}원</div>
                </div>
                <div className="flex items-center">
                    <h1 className="text-[1.5rem] font-bold mb-[8px]">{buyList?.itemName}</h1>
                    <div className="mx-[8px]">-</div>
                    <div className="text-[1.1rem] ">{itemPrice}원</div>
                </div>
                <div className="text-gray-500 mb-[32px]">
                    {buyList?.itemExplanation}
                </div>
                <div className="mb-[8px]">남는금액: </div>
                <div className="flex mb-[32px] flex-wrap">
                    <div>{currentMoney}원</div>
                    <div className="mx-[8px]">-</div>
                    <div>{itemPrice}원</div>
                    <div className="mx-[8px]">=</div>
                    {money - buyList?.itemPrice >= 0 ?
                        <div className="text-green-500">{left}원</div> :
                        <div className="text-red-500">{left}원</div>}

                </div>
                <div className="mb-[32px]">남은 수량: {buyList?.itemQuantity}</div>
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    <form onSubmit={onSubmit} className="w-[48%] max-[600px]:w-[100%]">
                        <button className="w-[100%] max-[600px]:w-[100%] bg-orange-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px]">구입</button>
                    </form>
                    <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 rounded-[5px] py-[8px]">취소</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

    )
}