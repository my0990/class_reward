import { useEffect, useState, useRef } from "react";
import { mutate } from "swr";
export default function DeleteModal({ pickedItem, currencyName }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isEdited, setIsEdited] = useState(false);
    const [itemStock, setItemStock] = useState('');


    const spanRef = useRef(null);
    const inputRef = useRef(null);

    const onChange = (e) => {
        if (isEdited === false) {
            setIsEdited(true)
        }
        if (/^[0-9]\d*$/.test(e.target.value) || e.target.value === '') {
            setItemStock(e.target.value)
        }

    }

    const onClose = () => {

        document.getElementById('delete').close();
        setTimeout(() => {
            setItemStock(pickedItem.itemStock);
            setIsEdited(false);
        }, 250)
    }

    const onSubmit = (e) => {
        e.preventDefault();
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/deleteItem", {
                method: "POST",
                body: JSON.stringify({ itemId: pickedItem.itemId }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {


                    setIsLoading(false);
                    mutate(
                        "/api/fetchClassData",
                        (prev) => {
                            return {...prev, itemList: prev.itemList.filter((item)=> item.itemId !== pickedItem.itemId)}
                        },
                        false // 서버 요청 없이 즉시 반영
                    );
                    document.getElementById('delete').close();
                }
            })
        }

    }
    const onSetItemStock = (e) => {
        e.preventDefault();
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/setItemStock", {
                method: "POST",
                body: JSON.stringify({ updatedItemStock: itemStock, itemId: pickedItem.itemId }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    
                    setIsEdited(false);
                    setIsLoading(false);
                    mutate('/api/fetchClassData');
                    document.getElementById('delete').close();
                }
            })
        }
    }
    useEffect(() => {
        if (pickedItem) {

            setItemStock(pickedItem.itemStock)
        }
    }, [pickedItem])

    useEffect(() => {
        if (spanRef.current && inputRef.current) {
            inputRef.current.style.width = `${spanRef.current.offsetWidth + 2}px`;
        }
    }, [itemStock]);

    if (!pickedItem) {
        return (
            <dialog id="delete" className="modal  modal-middle">
                <div></div>
            </dialog>
        )
    }

    return (
        <dialog id="delete" className="modal  modal-middle">
            <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200">
                <div className="flex items-center mb-[8px]">
                    <h1 className="text-[1.5rem] font-bold outline-none" tabIndex={99}>{pickedItem.itemName}</h1>
                    <div className="mx-[8px]">-</div>
                    <div className="text-[1.1rem] ">{pickedItem.itemPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyName}</div>
                </div>
                <div>
                    <div className="text-[160px] leading-none text-center my-[32px]">{pickedItem.emoji}</div>
                </div>
                <div className="text-gray-500 mb-[8px]">
                    {pickedItem.itemExplanation}
                </div>
                {/* <div className="mb-[32px]">남은 수량: {pickedItem.itemStock}</div> */}
                <div className="mb-[32px] ">남은 수량: <input ref={inputRef} className="box-content px-[16px] border-b-4 outline-none hover:cursor-pointer min-w-[12px] border-orange-500" onChange={onChange} value={itemStock} /></div>
                <span ref={spanRef} style={{ visibility: "hidden", position: "absolute", whiteSpace: "pre" }}>
                    {itemStock || " "}
                </span>
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    {isEdited
                        ? <form onSubmit={onSetItemStock} className="w-[48%] max-[600px]:w-[100%]">
                            <button className="w-[100%] max-[600px]:w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px] hover:bg-red-500">수정</button>
                        </form>
                        : <form onSubmit={onSubmit} className="w-[48%] max-[600px]:w-[100%]">
                            <button className="w-[100%] max-[600px]:w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px] hover:bg-red-500">삭제</button>
                        </form>}
                    <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 hover:bg-gray-300 rounded-[5px] py-[8px]" onClick={onClose}>취소</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>

        </dialog>

    )
}