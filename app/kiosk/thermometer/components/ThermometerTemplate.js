'use client'
import { useState } from "react"
import ThermometerBoard from "./ThermometerBoard";
import CharacterPickTemplate from "../../common/character/CharacterPickTeplate";
import ThermometerDonation from "./ThermometerDonation";

export default function ThermometerTemplate() {
    const [requestData, setRequestData] = useState({step: "thermometerBoard", userData: {}, donationData: {}})
    const {step} = requestData;
    return (
            step === "thermometerBoard"
            ? <ThermometerBoard setRequestData={setRequestData}/>
            : step === "thermometerCharacterPick"
            ? <CharacterPickTemplate type="thermometer" requestData={requestData} setRequestData={setRequestData}/>
            : <ThermometerDonation  requestData={requestData}/>
    )
}