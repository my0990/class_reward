import { useEffect } from "react";
export default function DeleteModal({ deleteId, itemList, setItemList, buyList }) {

    const onSubmit = (e) => {
        e.preventDefault();

        fetch("/api/deleteItem", {
            method: "POST",
            body: JSON.stringify({ itemId: deleteId }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {

            if (data.result === true) {
                alert('성공했습니다.')
                const newItemList = itemList.filter((it) => it.itemId !== deleteId);
                setItemList(newItemList);
                document.getElementById('my_modal_3').close()
            }
        })
    }

    useEffect(() => {

    }, [itemList, setItemList])
    return (
        <dialog id="my_modal_3" className="modal  modal-middle">
            {/* <div className="modal-box">
                    <div className=" flex  p-0 justify-center">
                        <div className="overflow-x-auto w-[512px]">
                            <div className="flex justify-between pb-5">
                                <div className="text-[1.5rem] ">삭제하시겠습니까?</div>
                            </div>
                            <form onSubmit={onSubmit}>
                            <button className="btn w-full bg-orange-500">확인</button>
                            </form>
                        </div>
                    </div>
                </div> */}
            <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200">

                <div className="flex items-center mb-[8px]">
                    <h1 className="text-[1.5rem] font-bold ">{buyList?.itemName}</h1>
                    <div className="mx-[8px]">-</div>
                    <div className="text-[1.1rem] ">{buyList?.itemPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원</div>
                </div>
                <div className="text-gray-500 mb-[8px]">
                    {buyList?.itemExplanation}
                </div>
                <div className="mb-[32px]">남은 수량: {buyList?.itemQuantity}</div>
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    <form onSubmit={onSubmit} className="w-[48%] max-[600px]:w-[100%]">
                        <button className="w-[100%] max-[600px]:w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px]">삭제</button>
                    </form>
                    <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 rounded-[5px] py-[8px]" onClick={()=> document.getElementById('my_modal_3').close()}>취소</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>

        </dialog>

    )
}