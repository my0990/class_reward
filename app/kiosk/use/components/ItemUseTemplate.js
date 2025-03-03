'use client'
import { useState } from "react";
import CharacterPickTemplate from "../../common/character/CharacterPickTeplate";
import ItemPickTemplate from "./ItemPickTemplate";


export default function ItemUse() {
    const [requestData,setRequestData] = useState({step: 'useCharacterPick', itemData: {}, userData: {}})
    return (
        requestData.step === "useCharacterPick"
            ? <CharacterPickTemplate type="use" requestData={requestData} setRequestData={setRequestData}/>
            : <ItemPickTemplate requestData={requestData} setRequestData={setRequestData}/>


    )


}