import { useEffect } from "react";
export default function DeleteModal({deleteId, itemList, setItemList}) {

    const onSubmit = (e) => {
        e.preventDefault();
        console.log('delete: ', deleteId)
        fetch("/api/deleteItem", {
            method: "POST",
            body: JSON.stringify({itemId: deleteId}),
            headers: {
              "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {

            if(data.result === true){
                alert('성공했습니다.')
                const newItemList = itemList.filter((it) => it.itemId !== deleteId);
                setItemList(newItemList);
                document.getElementById('my_modal_3').close()
            }
        })}

    useEffect(()=>{

    },[itemList,setItemList])
    return (
        <dialog id="my_modal_3" className="modal sm:modal-bottom modal-middle">
                <div className="modal-box">
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
                </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>

        </dialog>

    )
}