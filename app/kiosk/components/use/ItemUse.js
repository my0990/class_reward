import CharacterPickTemplate from "../character/CharacterPickTeplate";
import ItemUseTemplate from "./ItemUseTemplate";
import { useRecoilState } from 'recoil';
import {stepDataState} from '@/store/atoms';

export default function ItemUse() {

    const [stepData, setStepData] = useRecoilState(stepDataState)
    const {step} = stepData;
    return (
        step === "useCharacterPick"
            ? <CharacterPickTemplate type="use"/>
            : <ItemUseTemplate/>


    )


}