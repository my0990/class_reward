import CharacterPickTemplate from "./CharacterPickTeplate";
import ConfirmItemUse from "./ConfirmItemUse";
import ItemUseTemplate from "./ItemUseTemplate";
import { useState } from "react";
export default function ItemUse({ setStep, itemData, studentData, currencyName }) {
    const [isItemPicked, setIsItemPicked] = useState(false);
    const [requestData, setRequestData] = useState({ itemData: null, userId: null, userMoney: null , userName: null, checked: false, itemList: null})
    const [isPwdChecked, setIsPwdChecked] = useState(false);
    return (
        !isPwdChecked
            ? <CharacterPickTemplate setStep={setStep} studentData={studentData} setRequestData={setRequestData} requestData={requestData} setIsPwdChecked={setIsPwdChecked} isPwdChecked={isPwdChecked} currencyName={currencyName}/>
            : !isItemPicked
                ? <ItemUseTemplate currencyName={currencyName} itemData={itemData} setStep={setStep} setIsItemPicked={setIsItemPicked} setRequestData={setRequestData} requestData={requestData} />
                : <ConfirmItemUse requestData={requestData} setStep={setStep} currencyName={currencyName}/>

    )


}