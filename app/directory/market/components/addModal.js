import { useRef } from "react";
import { useRouter } from "next/navigation"

export default  function  AddModal({itemList, setItemList}) {
    const nameRef = useRef();
    const priceRef = useRef();
    const quantityRef = useRef();
    const router = useRouter();
    // const itemId = (new ObjectId()).toString()
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/addItem", {
            method: "POST",
            body: JSON.stringify({ itemName: nameRef.current.value, itemPrice: priceRef.current.value, itemQuantity: quantityRef.current.value}),
            headers: {
              "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if(data.result === true){
                alert('추가하였습니다.');
                document.getElementById('my_modal_2').close()
                setItemList(() => [...itemList,{ itemName: nameRef.current.value, itemPrice: priceRef.current.value, itemQuantity: quantityRef.current.value, itemId: data.itemId}])
                nameRef.current.value = ""
                priceRef.current.value = ""
                quantityRef.current.value = ""

            }
        })}
    return (
        <dialog id="my_modal_2" className="modal sm:modal-bottom modal-middle ">
            <div className="modal-box px-0">
            <div className=" flex justify-center p-0">
            <div className="overflow-x-auto w-[1024px]">
                <form onSubmit={onSubmit}>
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr>
                            <th className="">아이템 <br />이름</th>
                            <th className="">가격</th>
                            <th className="">수량</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>


                                <tr>
                                    <th><input className="" ref={nameRef}></input></th>
                                    <td><input className="" ref={priceRef}></input></td>
                                    <td><input className="" ref={quantityRef}></input></td>

                                    <td className="flex justify-center flex-wrap">
                                        <button className="btn bg-orange-300">추가</button>
                                    </td>

                                </tr>
                            


                    </tbody>

                </table>
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