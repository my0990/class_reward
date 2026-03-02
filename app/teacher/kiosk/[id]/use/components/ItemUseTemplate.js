'use client'
import { useState } from "react";
import CharacterPickTemplate from "../../common/character/CharacterPickTeplate";
import ItemPickTemplate from "./ItemPickTemplate";


export default function ItemUseTemplate({classId}) {
    const [requestData,setRequestData] = useState({step: 'useCharacterPick', itemData: {}, userData: {}})
    return (
        requestData.step === "useCharacterPick"
            ? <CharacterPickTemplate type="use" classId={classId} requestData={requestData} setRequestData={setRequestData}/>
            : <ItemPickTemplate requestData={requestData} classId={classId} setRequestData={setRequestData}/>


    )


}