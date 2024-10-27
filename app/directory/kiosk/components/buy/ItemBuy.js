import CharacterPickTemplate from "../character/CharacterPickTeplate";
import ConfirmItemBuy from "./ConfirmItemBuy";
import ItemBuyTemplate from "./ItemBuyTemplate";
import { useRecoilState } from 'recoil';
import { stepDataState } from '@/store/atoms';
export default function ItemBuy() {
    const [stepData, setStepData] = useRecoilState(stepDataState)
    const {step} = stepData;
    return (
        step === "buyItemPick"
            ? <ItemBuyTemplate />
            : step === "buyCharacterPick"
                ? <CharacterPickTemplate type="buy"/>
                : <ConfirmItemBuy />
    )


}