'use client'
import { useState } from "react";
import CharacterPickTemplate from "./CharacterPickTemplate";
import ConfirmItemBuy from "./ConfirmItemBuy";
import ItemPickTemplate from "./ItemPickTemplate";

export default function ItemBuy() {

    const [requestData,setRequestData] = useState({step: "buyItemPick", userData: {}, itemData: {}})

    return (
        requestData.step === "buyItemPick"
            ? <ItemPickTemplate setRequestData={setRequestData} />
            // : <CharacterPickTemplate type="buy" setRequestData={setRequestData} requestData={requestData}/>
            : requestData.step === "buyCharacterPick"
                ? <CharacterPickTemplate type="buy" setRequestData={setRequestData} requestData={requestData}/>
                : <ConfirmItemBuy setRequestData={setRequestData} requestData={requestData}/>
    )


}