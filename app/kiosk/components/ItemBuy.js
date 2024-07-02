import CharacterPickTemplate from "./CharacterPickTeplate";
import ConfirmItemBuy from "./ConfirmItemBuy";
import ItemBuyTemplate from "./ItemBuyTemplate";
import { useState } from "react";
export default function ItemBuy({ setStep, itemData, studentData }) {
    const [isItemPicked, setIsItemPicked] = useState(false);
    const [requestData, setRequestData] = useState({ itemData: null, userId: null, userMoney: null , userName: null, checked: false})
    const [isPwdChecked, setIsPwdChecked] = useState(false);
    console.log(studentData)
    return (
        !isPwdChecked
            ? <CharacterPickTemplate studentData={studentData} setRequestData={setRequestData} requestData={requestData} setIsPwdChecked={setIsPwdChecked} isPwdChecked={isPwdChecked} />
            : !isItemPicked
                ? <ItemBuyTemplate itemData={itemData} setStep={setStep} setIsItemPicked={setIsItemPicked} setRequestData={setRequestData} requestData={requestData} />
                : <ConfirmItemBuy requestData={requestData} />

    )


}