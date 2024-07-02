import CharacterPickTemplate from "./CharacterPickTeplate";
import ConfirmItemBuy from "./ConfirmItemBuy";
import ItemBuyTemplate from "./ItemBuyTemplate";
import { useState } from "react";
export default function ItemBuy({ setStep, itemData, studentData }) {
    const [isItemPicked, setIsItemPicked] = useState(false);
    const [requestData, setRequestData] = useState({ ItemData: null, UserId: null, userMoney: null , userName: null})
    const [isPwdChecked, setIsPwdChecked] = useState(false);
    return (
        !isPwdChecked
            ? <CharacterPickTemplate studentData={studentData} setRequestData={setRequestData} requestData={requestData} setIsPwdChecked={setIsPwdChecked} isPwdChecked={isPwdChecked} />
            : !isItemPicked
                ? <ItemBuyTemplate itemData={itemData} setStep={setStep} setIsItemPicked={setIsItemPicked} setRequestData={setRequestData} requestData={requestData} />
                : <ConfirmItemBuy requestData={requestData} />

    )


}