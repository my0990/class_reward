import { useState } from "react";

export default function ProfileBuyModal({ profileData, setUserData }) {
    const [isLoading, setIsLoading] = useState(false);
    const {urlData, urlId} = profileData;
    const onSubmit = (e) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/buyProfileImg", {
                method: "POST",
                body: JSON.stringify({ data: profileData }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => {
                if (!res.ok) { 
                    console.log('error')
                    alert('잔액이 부족합니다')
                    setIsLoading(false)
                    document.getElementById('profileBuy').close()
                    return;
                }

                return res.json()}).then((data) => {
                    if (data.result === true) {
                        setUserData((prev)=> ({...prev, profileUrlObj: {...prev.profileUrlObj, [urlId]: urlData.url}}))
                    } 
                    document.getElementById('profileBuy').close()
                    setIsLoading(false)
                }).catch((error)=>{
                    console.log('error occured')
                    console.log(error)
                })
        }

    }
    const onCloseModal = () => {
        document.getElementById('profileBuy').close()
    }
    return (
        <dialog id="profileBuy" className="modal  modal-middle ">
            <div className="modal-box p-[24px] dark:bg-orange-200 flex flex-col bg-orange-100 max-w-[320px] text-[1.2rem]">
                <h1>이 그림을 구매하시겠습니까?</h1>
                <div className="flex justify-between my-[32px]">
                    <div>가격: {profileData.urlData && profileData.urlData.price}</div>
                </div>
                <div className="flex justify-between">
                    <button onClick={onSubmit} className=" bg-orange-500 text-white py-[8px] hover:bg-orange-600 w-[120px] px-[24px] rounded-lg">확인</button>
                    <button onClick={onCloseModal} className=" text-gray-700 py-[8px] px-[24px] hover:bg-gray-300 w-[120px] rounded-lg bg-white-100">취소</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
                <button>close</button>
            </form>
        </dialog>
    )
}