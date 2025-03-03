import { useRouter } from "next/navigation";
import { useState } from "react";
import { mutate } from "swr";
export default function BuyModal({ buyList,  money, currencyName, currencyEmoji, userId }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const left = (money - buyList?.itemPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    const onSubmit = (e) => {
        e.preventDefault();
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            if (money < buyList.itemPrice) {
                alert('돈이 모자랍니다')
                setIsLoading(false);
                document.getElementById('buy').close()
                return
            }
            fetch("/api/buyItem", {
                method: "POST",
                body: JSON.stringify({ itemData: buyList, balance: left, userId:  userId}),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    alert('구매완료');
                    setIsLoading(false);
                    mutate('/api/fetchClassData')
                    // const newItemList = itemList.map((a, i) => a.itemId === buyList.itemId ? { ...a, 'itemQuantity': a.itemQuantity - 1 } : a)
                    // setItemList(newItemList);
                    document.getElementById('buy').close();
                    

                }
            })
        }

    }


    const itemPrice = buyList?.itemPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    const currentMoney = money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    return (
        <dialog id="buy" className="modal  modal-middle ">
            <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200">
                <div className="flex justify-end">
                    <div className="w-[20px] h-[20px] mr-[8px]">
                        {/* <Image src={gold} alt="money" /> */}
                    </div>
                    <div className="text-[0.9rem]">보유 {currencyName}: {currentMoney} {currencyEmoji} </div>
                </div>
                <div className="flex items-center">
                    <h1 className="text-[1.5rem] font-bold">{buyList?.itemName}</h1>
                    <div className="mx-[8px]">-</div>
                    <div className="text-[1.1rem] ">{itemPrice} {currencyName}</div>
                </div>
                <div>
                    <div className="text-[10rem] leading-none text-center my-[32px]">{buyList?.emoji}</div>
                </div>
                <div className="text-gray-500 mb-[32px]">
                    {buyList?.itemExplanation}
                </div>
                <div className="mb-[8px]">남는{currencyName}: </div>
                <div className="flex mb-[32px] flex-wrap">
                    <div>{currentMoney}{currencyName}</div>
                    <div className="mx-[8px]">-</div>
                    <div>{itemPrice}{currencyName}</div>
                    <div className="mx-[8px]">=</div>
                    {money - buyList?.itemPrice >= 0 ?
                        <div className="text-green-500">{left}{currencyName}</div> :
                        <div className="text-red-500">{left}{currencyName}</div>}
                </div>
                <div className={`mb-[32px] ${buyList?.itemStock < 3 ? "text-red-500 font-bold" : null}`}>남은 수량: {buyList?.itemStock}</div>
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    <form onSubmit={onSubmit} className="w-[48%] max-[600px]:w-[100%]">
                        <button className="w-[100%] max-[600px]:w-[100%] bg-orange-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px] outline-none hover:bg-orange-500">구입</button>
                    </form>
                    <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 rounded-[5px] py-[8px] hover:bg-gray-300" onClick={() => document.getElementById('buy').close()}>취소</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

    )
}