import ItemBuyCard from "./ItemBuyCard";
import { useState } from "react";
import Alert from "./Alert";

export default function ItemUseTemplate({ setStep, itemData, setIsItemPicked, setRequestData, requestData, currencyName }) {
    console.log(requestData)
    const tmp = requestData.itemList.map((a) => { a.checked = false; return a })
    const [itemList, setItemList] = useState(tmp)
    const [isSelected, setIsSelected] = useState(false);
    console.log('item')
    console.log(itemList)
    const onClick = (a) => {

        if (isSelected === false) {
            setIsSelected(true)
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
            document.getElementById('my_modal_2').showModal();
        }
    }
    const onModalClick = () => {
        document.getElementById('my_modal_2').close();
    }
    return (
        <div className="flex justify-center items-center h-[100vh] bg-orange-100">
            {/* <h1 className="text-[2.5rem] text-center">아이템을 선택하세요</h1>
            <div className="flex flex-wrap">
                {itemList.map((a, i) => {
                    return (
                        a.state === "사용 가능"
                        ? <ItemBuyCard onClick={e => onClick(a)} currencyname={currencyName} key={i} itemname={a.itemName} itemexplanation={a.itemExplanation} itemprice={a.itemPrice} checked={a.checked}/>
                        : null
                        )
                })}
            </div>
            <div className="flex">
                <button className="mr-[16px] btn" onClick={() => setStep('home')} >처음으로</button>
                <button className="btn" onClick={onNext}>다음</button>
            </div>
            <Alert setStep={onModalClick}>아이템을 선택해주세요</Alert> */}

            <div className="bg-orange-200 p-[32px]  h-[552px] rounded-2xl flex justify-center">
                <div className="bg-orange-200 p-[8px]">
                    <h1 className="text-[3rem] ml-[16px]">
                        창고
                    </h1>
                    <div className="flex justify-center">
                        <div className="flex flex-wrap w-[360px] h-[400px]  overflow-scroll overflow-x-hidden">
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg">🍪</div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                            <div className="w-[64px] h-[64px] bg-white m-[8px] hover:bg-yellow-300 text-[56px]   flex justify-center items-center cursor-pointer hover:scale-110 transition-all rounded-lg"></div>
                          
                        </div>
                    </div>
                </div>
                <div className="bg-orange-200 w-[320px] flex justify-center items-center p-[16px]  ">
                    <div className="bg-white  h-[100%] p-[16px] flex flex-col justify-evenly rounded-xl">
                        <div className="text-[160px] leading-none text-center">🍪</div>
                        <div>
                            <h1 className="text-[2.5rem]">쿠키</h1>
                            <div className="text-[1rem]">식사는 없어~~ 배고파도 음료도 없어~~ 목말라도</div>
                        </div>
                        <button className="btn">사용하기</button>
                    </div>
                </div>
            </div>
        </div>
    )
}