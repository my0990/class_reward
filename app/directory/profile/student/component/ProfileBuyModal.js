import { useState } from "react";
import { mutate } from "swr";
export default function ProfileBuyModal({ modalData, currencyName, userId, money }) {
    const [isLoading, setIsLoading] = useState(false);
    const onSubmit = (e) => {
        if (modalData.urlData.price > money) {
            alert('잔액이 부족합니다')
            return
        }
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/buyProfileImg", {
                method: "POST",
                body: JSON.stringify({ modalData: modalData, userId: userId, balance: money - modalData.urlData.price }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => {
                if (!res.ok) {
                    alert('error')

                    
                    return;
                }

                return res.json()
            }).then((data) => {

                if (data.result === true) {
                    alert('구입하였습니다');
                    // document.getElementById('profileBuy').close();
                    const urlId = modalData.urlId;
                    mutate(
                        "/api/fetchClassData",
                        (prevItems) => {
                            console.log(prevItems)
                            const updatedItems = { ...prevItems.profileImgStorage };
                            console.log("1: ", updatedItems)
                            delete updatedItems[urlId]; // 객체에서 특정 키 삭제
                            console.log("2: ",updatedItems)
                            return {... prevItems, profileImgStorage: updatedItems};
                        },
                        false // 서버 요청 없이 즉시 반영
                    );
                    document.getElementById('profileBuy').close();



                }

                setIsLoading(false)
            }).catch((error) => {
                console.log('error occured')
                console.log(error)
            })
        }
        setIsLoading(false)
    }
    const onCloseModal = () => {
        document.getElementById('profileBuy').close()
    }

    return (
        <dialog id="profileBuy" className="modal  modal-middle ">
            <div className="modal-box p-[24px] dark:bg-orange-200 flex flex-col bg-orange-100 max-w-[320px] text-[1.2rem]">
                <h1>이 그림을 구매하시겠습니까?</h1>
                <div className="flex justify-center my-[16px]">
                    <div className="w-[160px] h-[160px] border-[8px] border-white rounded-full bg-white flex justify-center items-center overflow-hidden">
                        <img src={modalData?.urlData?.url} width="200" height="200" alt="profileImg" />
                    </div>
                </div>
                <div className="flex justify-between ">
                    <div>가격: </div>
                    <div>{modalData.urlData && modalData.urlData.price} {currencyName}</div>
                </div>
                <div className="flex justify-between mt-[32px]">
                    <button onClick={onSubmit} className=" bg-orange-500 text-white py-[8px] hover:bg-orange-600 w-[128px] px-[24px] rounded-lg">확인</button>
                    <button onClick={onCloseModal} className="bg-gray-300 text-gray-700 py-[8px] px-[24px] hover:bg-gray-400 w-[128px] rounded-lg bg-white-100">취소</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
                <button>close</button>
            </form>
        </dialog>
    )
}