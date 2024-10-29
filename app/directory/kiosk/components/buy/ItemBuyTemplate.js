import Alert from "../Alert";
import ItemBuyCard from "./ItemBuyCard";
import { useState } from "react";
import { userDataState, stepDataState, requestDataState } from '@/store/atoms';
import { useRecoilState } from "recoil";

export default function ItemBuyTemplate() {


    const [isSelected, setIsSelected] = useState(false);
    const [userData, setUserData] = useRecoilState(userDataState);
    const [stepData, setStepData] = useRecoilState(stepDataState);
    const [requestData, setRequestData] = useRecoilState(requestDataState);
    const tmp = JSON.parse(JSON.stringify(userData.itemList)).map((a) => { a.checked = false; return a })
    const [itemList, setItemList] = useState(tmp);
    const { currencyName, currencyEmoji } = userData.classData;
    const onClick = (a) => {

        if (isSelected === false) {
            setIsSelected(true)
        }
        setRequestData(prev => ({ ...prev, itemData: a }))
        // const updatedItems = itemList.map(item => {
        //     if (item.itemId === a.itemId) {
        //         return { ...item, checked: true };
        //     } else {
        //         return { ...item, checked: false }
        //     }
        // });
        // setItemList(updatedItems);
        setStepData({ menu: "buy", step: "buyCharacterPick" })

    }
    const onNext = () => {
        if (isSelected) {
            setStepData({ menu: "buy", step: "buyCharacterPick" })
        } else {
            document.getElementById('my_modal_2').showModal()
        }
    }
    const onModalFinish = () => {
        document.getElementById('my_modal_2').close()
    }
    return (
        <div className="flex flex-col justify-center items-center relative overflow-hidden">
            <div className="flex justify-betwen min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                <div className="flex mr-auto cursor-pointer hover:scale-110 transition-all" onClick={() => setStepData({ menu: "home", step: null })}>
                    <div className="h-[64px] w-[24px] flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                    </div>
                    <div className="flex items-center text-[2rem]">이전</div>
                </div>
                <h1 className="text-[2.5rem] text-center">아이템을 선택하세요</h1>
                <div className=" opacity-0 flex mr-auto cursor-pointer hover:scale-110 transition-all">
                    <div className="h-[64px] w-[24px] flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" /></svg>
                    </div>
                    <div className="flex items-center text-[2rem]">이전</div>
                </div>
            </div>
            <div className="flex flex-wrap min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                {itemList.map((a, i) => {
                    return (
                        <div key={i} className={`m-[16px] w-[192px]   flex justify-center items-center relative bg-orange-200 shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg ${a.itemQuantity <= 0 ? "" : "hover:scale-110 transition-all"} `}>
                            <ItemBuyCard onChecked={onClick} itemData={a} currencyname={currencyName} currencyemoji={currencyEmoji} />
                        </div>
                    )
                })}
            </div>
            {/* <div className="flex">
                <button className="mr-[16px] btn" onClick={() => setStepData({ menu: "home", step: null })} >처음으로</button>
                <button className="btn" onClick={onNext}>다음</button>
            </div> */}
            <Alert onModalFinish={onModalFinish} >아이템을 선택해주세요</Alert>
        </div>
    )
}