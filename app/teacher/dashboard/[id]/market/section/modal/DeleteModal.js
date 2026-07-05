// import { useEffect, useState, useRef } from "react";
// import { mutate } from "swr";
// export default function DeleteModal({ pickedItem, currencyName, currencyEmoji, classId }) {
//     const [isLoading, setIsLoading] = useState(false);
//     const [isEdited, setIsEdited] = useState(false);
//     const [itemStock, setItemStock] = useState('');
//     const [price, setPrice] = useState('');

//     const spanRef = useRef(null);
//     const inputRef = useRef(null);



//     const onChange = (e) => {
//         if (isEdited === false) {
//             setIsEdited(true)
//         }
//         if (/^[0-9]\d*$/.test(e.target.value) || e.target.value === '') {
//             setItemStock(e.target.value)
//         }
//     }
//     const priceSpanRef = useRef(null);
//     const priceInputRef = useRef(null);

//     const onPriceChange = (e) => {
//         if (isEdited === false) {
//             setIsEdited(true)
//         }
//         if (/^[0-9]\d*$/.test(e.target.value) || e.target.value === '') {
//             setPrice(e.target.value)
//         }
//     }

//     const onClose = () => {

//         document.getElementById('delete').close();
//         setTimeout(() => {
//             setItemStock(pickedItem.itemStock);
//             setPrice(pickedItem.itemPrice);
//             setIsEdited(false);
//         }, 250)
//     }

//     const onSubmit = (e) => {
//         e.preventDefault();
//         if (isLoading) {
//             return
//         } else {
//             setIsLoading(true)
//             fetch("/api/deleteItem", {
//                 method: "POST",
//                 body: JSON.stringify({ itemId: pickedItem.itemId, classId: classId }),
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             }).then((res) => res.json()).then((data) => {
//                 if (data.result === true) {


//                     setIsLoading(false);
//                     mutate(
//                         `/api/classData/${classId}`,
//                     );
//                     document.getElementById('delete').close();
//                 }
//             })
//         }

//     }
//     const onSetItemStock = (e) => {
//         e.preventDefault();
//         if (isLoading) {
//             return
//         } else {
//             setIsLoading(true)
//             fetch("/api/setItemStock", {
//                 method: "POST",
//                 body: JSON.stringify({ updatedItemStock: itemStock, updatedItemPrice: price, itemId: pickedItem.itemId, classId: classId }),
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             }).then((res) => res.json()).then((data) => {
//                 if (data.result === true) {

//                     setIsEdited(false);
//                     setIsLoading(false);
//                     mutate(
//                         `/api/classData/${classId}`,
//                     );
//                     document.getElementById('delete').close();
//                 }
//             })
//         }
//     }
//     useEffect(() => {
//         if (pickedItem) {
//             console.log(pickedItem)
//             setItemStock(pickedItem.itemStock)
//             setPrice(pickedItem.itemPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
//         }
//     }, [pickedItem])

//     useEffect(() => {
//         if (spanRef.current && inputRef.current) {
//             inputRef.current.style.width = `${spanRef.current.offsetWidth + 2}px`;
//         }
//     }, [itemStock]);

//     useEffect(() => {
//         if (priceSpanRef.current && priceInputRef.current) {
//             priceInputRef.current.style.width = `${priceSpanRef.current.offsetWidth + 2}px`;
//         }
//     }, [price]);

//     if (!pickedItem) {
//         return (
//             <dialog id="delete" className="modal  modal-middle">
//                 <div></div>
//             </dialog>
//         )
//     }

//     return (
//         <dialog id="delete" className="modal  modal-middle">
//             <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200">
//                 <div className="flex items-center mb-[8px]">
//                     <h1 className="text-[1.5rem] font-bold outline-none" tabIndex={99}>{pickedItem.itemName}</h1>
//                 </div>
//                 <div>
//                     <div>
//                         <div className="text-[160px] leading-none text-center mt-[32px] mb-[16px]">{pickedItem.emoji}</div>
//                     </div>
//                 </div>
//                 <div className="text-gray-500 mb-[8px]">
//                     {pickedItem.itemExplanation}
//                 </div>

//                 <div className="mb-[8px] mt-[16px] ">
//                     재고: <input ref={inputRef} className="box-content px-[8px] border-b-4 border-orange-500 outline-none hover:cursor-pointer " onChange={onChange} value={itemStock} />개
//                 </div>
//                 <span ref={spanRef} style={{ visibility: "hidden", position: "absolute", whiteSpace: "pre" }}>
//                     {itemStock || " "}
//                 </span>

//                 <div className="mb-[32px] ">
//                     가격: <input ref={priceInputRef} className="box-content px-[8px] border-b-4 border-orange-500  outline-none hover:cursor-pointer " onChange={onPriceChange} value={price} />{currencyName}
//                 </div>
//                 <span ref={priceSpanRef} style={{ visibility: "hidden", position: "absolute", whiteSpace: "pre" }}>
//                     {price || " "}
//                 </span>

//                 <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
//                     {isEdited
//                         ? <form onSubmit={onSetItemStock} className="w-[48%] max-[600px]:w-[100%]">
//                             <button className="w-[100%] max-[600px]:w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px] hover:bg-red-500">수정</button>
//                         </form>
//                         : <form onSubmit={onSubmit} className="w-[48%] max-[600px]:w-[100%]">
//                             <button className="w-[100%] max-[600px]:w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px] hover:bg-red-500">삭제</button>
//                         </form>}
//                     <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 hover:bg-gray-300 rounded-[5px] py-[8px]" onClick={onClose}>취소</button>
//                 </div>
//             </div>
//             <form method="dialog" className="modal-backdrop">
//                 <button onClick={onClose}>close</button>
//             </form>

//         </dialog>

//     )
// }

import { useEffect, useState, useRef } from "react";
import { mutate } from "swr";

export default function DeleteModal({ pickedItem, currencyName, currencyEmoji, classId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isEdited, setIsEdited] = useState(false);
    const [itemStock, setItemStock] = useState('');
    const [price, setPrice] = useState('');

    const onChange = (e) => {
        if (isEdited === false) {
            setIsEdited(true)
        }
        if (/^[0-9]\d*$/.test(e.target.value) || e.target.value === '') {
            setItemStock(e.target.value)
        }
    }

    const onPriceChange = (e) => {
        if (!isEdited) {
            setIsEdited(true);
        }

        const value = e.target.value.replace(/,/g, "").replace(/\D/g, "");

        if (value === "") {
            setPrice("");
        } else {
            setPrice(String(Number(value)));
        }
    };

    const onClose = () => {
        document.getElementById('delete').close();

        setTimeout(() => {
            setItemStock(pickedItem.itemStock);
            setPrice(pickedItem.itemPrice);
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
                body: JSON.stringify({ itemId: pickedItem.itemId, classId: classId }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    setIsLoading(false);
                    mutate(`/api/classData/${classId}`);
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
                body: JSON.stringify({
                    updatedItemStock: itemStock,
                    updatedItemPrice: price,
                    itemId: pickedItem.itemId,
                    classId: classId
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    setIsEdited(false);
                    setIsLoading(false);
                    mutate(`/api/classData/${classId}`);
                    document.getElementById('delete').close();
                }
            })
        }
    }

    useEffect(() => {
        if (pickedItem) {
            setItemStock(pickedItem.itemStock)
            setPrice(pickedItem.itemPrice)
        }
    }, [pickedItem])

    if (!pickedItem) {
        return (
            <dialog id="delete" className="modal modal-middle">
                <div></div>
            </dialog>
        )
    }

    return (
        <dialog id="delete" className="modal modal-middle">
            <div className="modal-box min-[600px]:p-[24px] dark:bg-orange-200">
                <div className="flex items-center mb-[8px]">
                    <h1 className="text-[1.5rem] font-bold outline-none" tabIndex={99}>
                        {pickedItem.itemName}
                    </h1>
                </div>

                <div>
                    <div>
                        <div className="text-[160px] leading-none text-center mt-[32px] mb-[16px]">
                            {pickedItem.emoji}
                        </div>
                    </div>
                </div>

                <div className="text-gray-500 mb-[8px]">
                    {pickedItem.itemExplanation}
                </div>

                <div className="mb-[32px]  ">
                    <div className="rounded-2xl  p-4">
                        <p className="mb-2 text-sm font-bold text-orange-700">
                            재고
                        </p>

                        <div className="flex  items-center border-2 border-orange-200 rounded-2xl bg-white px-4 shadow-sm">
                            <input
                                className="w-full py-3 text-right text-2xl cursor-pointer font-extrabold text-gray-800 outline-none"
                                onChange={onChange}
                                value={itemStock}
                                inputMode="numeric"
                                placeholder="0"
                            />

                            <span className="ml-2 shrink-0 text-lg font-bold text-orange-500">
                                개
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl  px-4">
                        <p className="mb-2 text-sm font-bold text-orange-700">
                            가격
                        </p>

                        <div className="flex items-center border-2 border-orange-200 rounded-2xl bg-white px-4 shadow-sm">
                            <input
                                className="w-full py-3 text-right cursor-pointer text-2xl font-extrabold text-gray-800 outline-none"
                                onChange={onPriceChange}
                                value={price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                inputMode="numeric"
                                placeholder="0"
                            />

                            <span className="ml-2 shrink-0 text-lg font-bold text-orange-500">
                                {currencyEmoji}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    {isEdited
                        ? <form onSubmit={onSetItemStock} className="w-[48%] max-[600px]:w-[100%]">
                            <button className="w-[100%] max-[600px]:w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px] hover:bg-red-500">
                                수정
                            </button>
                        </form>
                        : <form onSubmit={onSubmit} className="w-[48%] max-[600px]:w-[100%]">
                            <button className="w-[100%] max-[600px]:w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px] hover:bg-red-500">
                                삭제
                            </button>
                        </form>}

                    <button
                        className="w-[48%] max-[600px]:w-[100%] bg-gray-200 hover:bg-gray-300 rounded-[5px] py-[8px]"
                        onClick={onClose}
                    >
                        취소
                    </button>
                </div>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    )
}