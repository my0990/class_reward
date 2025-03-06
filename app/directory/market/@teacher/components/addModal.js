import { useRef } from "react";
import { useState } from "react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { mutate } from "swr";
export default function AddModal() {
    const nameRef = useRef();
    const priceRef = useRef();
    const quantityRef = useRef();
    const explanationRef = useRef();
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emoji, setEmoji] = useState();


    const onSubmit = (e) => {
        e.preventDefault();
        if (isLoading) {
            return
        } else {
            setIsLoading(true);
            if (nameRef.current.value === "" || priceRef.current.value === "" || quantityRef.current.value === "" || explanationRef.current.value === "") {
                setIsError(true)
                setIsLoading(false);
                return
            }
            fetch("/api/addItem", {
                method: "POST",
                body: JSON.stringify({ itemName: nameRef.current.value, itemPrice: priceRef.current.value, itemStock: quantityRef.current.value, itemExplanation: explanationRef.current.value, emoji: emoji }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    setIsLoading(false);
                    mutate(
                        "/api/fetchClassData",
                        )
                    document.getElementById('add').close()
                    nameRef.current.value = ""
                    priceRef.current.value = ""
                    quantityRef.current.value = ""
                    explanationRef.current.value = ""
                    setEmoji(null)

                }
            })
        }

    }

    const onCloseModal = () => {
        nameRef.current.value = ""
        priceRef.current.value = ""
        quantityRef.current.value = ""
        explanationRef.current.value = ""
        setEmoji(null)
        document.getElementById('add').close()
        setTimeout(() => {
            setEmoji(null);
        }, 200)

        setIsError(false)

    }
    return (
        <dialog id="add" className="modal  modal-middle ">

            <div className=" max-w-[800px] modal-box  p-[16px] min-[600px]:p-[32px] dark:bg-orange-200">
                <div className="text-right absolute top-5 right-5 text-[1.2rem] cursor-pointer leading-none max-[600px]:top-3 min-[600px]:right-3 hover:bg-gray-300 hover:rounded-full w-[34px] h-[34px] flex justify-center items-center" onClick={onCloseModal}>x</div>
                <h1 className="text-[1.5rem] mb-[32px]">학급 아이템 추가하기</h1>
                <div className="flex justify-evenly flex-wrap">
                    <div className="mb-[16px] w-[352px]">
                        <h1 className="w-full outline-none" tabIndex={99}>아이템 이미지</h1>
                        {!emoji ? <div className="flex justify-center  overflow-hidden " tabIndex={-1}>
                            <Picker
                                style={{ height: '300px', width: '400px' }}
                                data={data}
                                onEmojiSelect={(emojiObject) => setEmoji(emojiObject.native)}
                                locale="ko"
                                emojiButtonColors={[
                                    'rgba(155,223,88,.7)',
                                    'rgba(149,211,254,.7)',
                                    'rgba(247,233,34,.7)',
                                    'rgba(238,166,252,.7)',
                                    'rgba(255,213,143,.7)',
                                    'rgba(211,209,255,.7)',
                                ]}
                                categories={[
                                    'foods',
                                    'activity',
                                    'flags',
                                    'frequent',
                                    'nature',
                                    'objects',
                                    'people',
                                    'places',
                                    'symbols',
                                ]}
                            />
                        </div>
                            : <div >
                                <div className="relative w-full flex justify-center w-[352px] h-[430px] items-center bg-orange-100 p-[16px] rounded-lg">
                                    <div className="absolute top-3 right-4 cursor-pointer hover:scale-110 transition-all" onClick={() => setEmoji(null)}>뒤로가기</div>
                                    <div className="text-[160px]">
                                        {emoji}
                                    </div>
                                </div>
                            </div>}


                    </div>
                    <div className="w-[320px]">
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
                                <button className="w-[100%] bg-orange-300 h-[40px] roundd-xl mb-[16px] text-white rounded-xl hover:bg-orange-500">만들기</button>
                            </form>
                            <button onClick={onCloseModal} className=" h-[40px] hover:text-white hover:bg-orange-300 rounded-xl hover:bg-orange-500">취소</button>
                        </div>

                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
                <button>close</button>
            </form>
        </dialog>

    )
}