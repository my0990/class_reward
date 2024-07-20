import CharacterPickTemplate from "./CharacterPickTeplate";
import ConfirmItemBuy from "./ConfirmItemBuy";
import ItemBuyTemplate from "./ItemBuyTemplate";
import { useState } from "react";
export default function ItemBuy({ setStep, itemData, studentData, currencyName, currencyEmoji}) {
    const [isItemPicked, setIsItemPicked] = useState(false);
    const [requestData, setRequestData] = useState({ itemData: null, userId: null, userMoney: null , userName: null, checked: false})
    const [isPwdChecked, setIsPwdChecked] = useState(false);
    return (
        !isPwdChecked
            ? <CharacterPickTemplate setStep={setStep} studentData={studentData} setRequestData={setRequestData} requestData={requestData} setIsPwdChecked={setIsPwdChecked} isPwdChecked={isPwdChecked} currencyName={currencyName} currencyEmoji={currencyEmoji}/>
            : !isItemPicked
                ? <ItemBuyTemplate itemData={itemData} setStep={setStep} setIsItemPicked={setIsItemPicked} setRequestData={setRequestData} requestData={requestData} currencyName={currencyName} currencyEmoji={currencyEmoji}/>
                : <ConfirmItemBuy requestData={requestData} setStep={setStep} currencyName={currencyName} currencyEmoji={currencyEmoji}/>

    )


}