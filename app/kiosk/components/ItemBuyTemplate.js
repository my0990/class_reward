import ItemBuyCard from "./ItemBuyCard";
import { useState } from "react";
export default function ItemBuyTemplate({ setStep, itemData, setIsItemPicked, setRequestData, requestData }) {
    const tmp = itemData.map((a) => { a.checked = false; return a })
    const [itemList, setItemList] = useState(tmp)
    const [isSelected,setIsSelected] = useState(false);
    const onClick = (a) => {
        
        if(isSelected === false){
            setIsSelected(true)
        }
        if (a.itemPrice > requestData.userMoney) {
            alert('돈이 모자랍니다')
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
        if(isSelected){
            setIsItemPicked(true)
        } else {
            alert('아이템을 선택해주세요')
        }
    }
    return (
        <div className="flex flex-col justify-center items-center">
            <h1 className="text-[2.5rem] text-center">아이템을 선택하세요</h1>
            <div className="flex flex-wrap">
                {itemList.map((a, i) => {
                    return (
                        <ItemBuyCard onClick={e => onClick(a)} key={i} itemname={a.itemName} itemdetail={a.itemExplanation} itemprice={a.itemPrice} checked={a.checked} />
                    )
                })}
            </div>
            <div className="flex">
                <button className="mr-[16px] btn" onClick={() => setStep('home')} >처음으로</button>
                <button className="btn" onClick={onNext}>다음</button>
            </div>
        </div>
    )
}