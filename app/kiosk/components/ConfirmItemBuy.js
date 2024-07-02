import { useState } from "react";
export default function ConfirmItemBuy({ requestData }) {
    console.log(requestData)
    const [isLoading, setIsLoading] = useState(false);
    const { requestItemData, requestUserId, userMoney } = requestData;
    const onClick = (e) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/buyItemFromKiosk", {
                method: "POST",
                body: JSON.stringify({ itemData: requestItemData, userId: requestUserId }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    alert('ttt')
                    location.reload();

                } else {
                    document.getElementById('my_modal_3').close()
                    setIsLoading(false)
                }
            })
        }

    }
    return (
        <div>
            <h1>아이템을 구입하시겠습니까?</h1>
            <div>아이템 이름: {requestItemData.itemName}</div>
            <div>아이템 설명: {requestItemData.itemExplanation}</div>
            <div>아이템 가격: {requestItemData.itemPrice}</div>
            <button className="btn" onClick={onClick}>구입</button>
            <button className="btn" onClick={() => location.reload()}>취소</button>
        </div>
    )
}