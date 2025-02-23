'use client'
import { useState } from "react";
import CharacterPickTemplate from "../../../components/character/CharacterPickTeplate";
import ConfirmItemBuy from "./ConfirmItemBuy";
import ItemBuyTemplate from "./ItemBuyTemplate";

export default function ItemBuy() {
    const [step, setStep] = useState("buyItemPick");

    return (
        step === "buyItemPick"
            ? <ItemBuyTemplate setStep={setStep}/>
            : <CharacterPickTemplate type="buy"/>
            // : step === "buyCharacterPick"
                // ? <CharacterPickTemplate type="buy"/>
                // : <ConfirmItemBuy />
    )


}