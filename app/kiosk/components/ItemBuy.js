import CharacterPickTemplate from "./CharacterPickTeplate";
import ItemBuyCard from "./ItemBuyCard";
import ItemBuyTemplate from "./ItemBuyTemplate";
import { useState } from "react";
export default function ItemBuy({ setStep, itemData, studentData }) {
    console.log(itemData)
    const [isItemPicked, setIsItemPicked] = useState(false);
    const [requestData,setRequestData] = useState({requestItemData: null,  requestUserId: null})
    return (
        isItemPicked
            ? <CharacterPickTemplate studentData={studentData} setRequestData={setRequestData} requestData={requestData}/>
            : <ItemBuyTemplate itemData={itemData} setStep={setStep} setIsItemPicked={setIsItemPicked} setRequestData={setRequestData} requestData={requestData}/>
    )


}