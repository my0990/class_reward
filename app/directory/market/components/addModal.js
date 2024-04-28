import { useRef } from "react";
import { useRouter } from "next/navigation"
import { useState } from "react";
import exp from "constants";
export default function AddModal({ itemList, setItemList }) {
    const nameRef = useRef();
    const priceRef = useRef();
    const quantityRef = useRef();
    const explanationRef = useRef();
    const [isError, setIsError] = useState(false);
    const onSubmit = (e) => {
        e.preventDefault();
        if (nameRef.current.value === "" || priceRef.current.value === "" || quantityRef.current.value === ""  || explanationRef.current.value === "" ) {
            setIsError(true)
            return
        }
        fetch("/api/addItem", {
            method: "POST",
            body: JSON.stringify({ itemName: nameRef.current.value, itemPrice: priceRef.current.value, itemQuantity: quantityRef.current.value, itemExplanation: explanationRef.current.value }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {

            if (data.result === true) {
                alert('추가하였습니다.');
                document.getElementById('my_modal_2').close()
                setItemList(() => [...itemList, { itemName: nameRef.current.value, itemPrice: priceRef.current.value, itemQuantity: quantityRef.current.value, itemId: data.itemId, itemExplanation: explanationRef.current.value }])
                nameRef.current.value = ""
                priceRef.current.value = ""
                quantityRef.current.value = ""
                explanationRef.current.value = ""
            }
        })
    }

    const onCloseModal = () => {
        nameRef.current.value = ""
        priceRef.current.value = ""
        quantityRef.current.value = ""
        explanationRef.current.value = ""
        document.getElementById('my_modal_2').close()
        setIsError(false)
    }
    return (
        <dialog id="my_modal_2" className="modal  modal-middle ">
            {/* <div className="modal-box px-0">
                <div className=" flex justify-center p-0">
                    <div className="overflow-x-auto w-[1024px]">
                        <form onSubmit={onSubmit}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="">아이템 <br />이름</th>
                                        <th className="">가격</th>
                                        <th className="">수량</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th><input className="border-2 w-[50px]" ref={nameRef}></input></th>
                                        <td><input className="border-2 w-[50px]" ref={priceRef}></input></td>
                                        <td><input className="border-2 w-[50px]" ref={quantityRef}></input></td>
                                    </tr>
                                </tbody>
                            </table>
                            <button className="btn bg-orange-300 w-full">추가</button>
                        </form>
                    </div>
                </div>
            </div> */}

            <div className="modal-box  p-[16px] min-[600px]:p-[32px]">
                <div className="text-right absolute top-5 right-5 text-[1.2rem] cursor-pointer leading-none max-[600px]:top-3 min-[600px]:right-3 hover:bg-gray-300 hover:rounded-full w-[34px] h-[34px] flex justify-center items-center" onClick={onCloseModal}>x</div>
                <h1 className="text-[1.5rem] mb-[32px]">학급 아이템 추가하기</h1>
                <div className="mb-[16px]">
                    <h1 >아이템 이름</h1>
                    <input ref={nameRef} className="w-[100%] rounded-xl h-[40px] bg-orange-100 outline-0 text-[1.3rem] indent-3" />
                </div>
                <div className="mb-[16px]">
                    <h1 >아이템 설명</h1>
                    <input ref={explanationRef} className="w-[100%] rounded-xl h-[40px] bg-orange-100 outline-0 text-[1.3rem] indent-3" />
                </div>
                <div className="mb-[16px]">
                    <h1>가격</h1>
                    <input type="number" ref={priceRef} className="w-[100%] rounded-xl h-[40px] bg-orange-100 outline-0 text-[1.3rem] indent-3 " />
                </div>
                <div className="mb-[32px]">
                    <h1>수량</h1>
                    <input type="number" ref={quantityRef} className="w-[100%] rounded-xl h-[40px] bg-orange-100 outline-0 text-[1.3rem] indent-3" />
                </div>

                <div className="flex flex-col relative">
                    <form onSubmit={onSubmit}>
                        {isError && <div className="text-center text-red-500 absolute top-[-27px] left-[50%] translate-x-[-50%]">모두 입력해주세요</div>}
                        <button className="w-[100%] bg-orange-300 h-[40px] roundd-xl mb-[16px] text-white rounded-xl">만들기</button>
                    </form>
                    <button onClick={onCloseModal} className=" h-[40px] hover:text-white hover:bg-orange-300 rounded-xl">취소</button>
                </div>

            </div>

            <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
                <button>close</button>
            </form>
        </dialog>

    )
}