'use client'
import { useState } from "react";
import DonateCharacterPick from "./DonateCharacterPick";
import ConfirmDonate from "./ConfirmDonate";
export default function DonateTemplate({classId}) {

    const [requestData, setRequestData] = useState({step : "SELECT_CHARACTER"});
    return (
        <div>
            {requestData.step === "SELECT_CHARACTER" && <DonateCharacterPick type="thermometer" requestData={requestData} setRequestData={setRequestData}/>}
            {requestData.step === "SELECT_AMOUNT" && <ConfirmDonate requestData={requestData} setRequestData={setRequestData} classId={classId}/>}
        </div>
    )
}