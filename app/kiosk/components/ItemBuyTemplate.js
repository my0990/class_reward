import Alert from "./Alert";
import ItemBuyCard from "./ItemBuyCard";
import { useState } from "react";
export default function ItemBuyTemplate({ setStep, itemData, setIsItemPicked, setRequestData, requestData, currencyName, currencyEmoji }) {
    const tmp = itemData.map((a) => { a.checked = false; return a })
    const [itemList, setItemList] = useState(tmp)
    const [isSelected, setIsSelected] = useState(false);
    const onClick = (a) => {

        if (isSelected === false) {
            setIsSelected(true)
        }
        if (a.itemPrice > requestData.userMoney) {
            document.getElementById('my_modal_2').showModal()
            return
        }
        setRequestData(prev => ({ ...prev, itemData: a }))
        const updatedItems = itemList.map(item => {
            // 대상 사용자를 찾으면 비밀번호를 변경
            if (item.itemId === a.itemId) {
                return { ...item, checked: true };
            } else {
                return { ...item, checked: false }
            }
        });

        // 업데이트된 사용자 리스트를 상태로 설정
        setItemList(updatedItems);
    }
    const onNext = () => {
        if (isSelected) {
            setIsItemPicked(true)
        } else {
            document.getElementById('my_modal_2').showModal()
        }
    }
    const onModalClick = () => {
        document.getElementById('my_modal_2').close()
    }
    return (
        <div className="flex flex-col justify-center items-center">
            <h1 className="text-[2.5rem] text-center">아이템을 선택하세요</h1>
            <div className="flex flex-wrap min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                {itemList.map((a, i) => {
                    return (
                        <div key={i}  className={`m-[16px] w-[192px]   flex justify-center items-center relative bg-orange-200 shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg ${a.itemQuantity <= 0 ? "" : "hover:scale-110 transition-all"} `}>
                            <ItemBuyCard onClick={e => a.itemQuantity <= 0 ? null : onClick(a)} itemquantity={a.itemQuantity} itemname={a.itemName} itemexplanation={a.itemExplanation} itemprice={a.itemPrice} checked={a.checked} currencyname={currencyName} currencyemoji={currencyEmoji} emoji={a.emoji} />
                        </div>
                    )
                })}
            </div>
            <div className="flex">
                <button className="mr-[16px] btn" onClick={() => setStep('home')} >처음으로</button>
                <button className="btn" onClick={onNext}>다음</button>
            </div>
            <Alert setStep={onModalClick}>{isSelected ? '돈이 모자랍니다' : '아이템을 선택해주세요'}</Alert>
        </div>
    )
}