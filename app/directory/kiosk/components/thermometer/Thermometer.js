import { useRecoilState } from 'recoil';
import { stepDataState, thermometerDataState } from '@/store/atoms';
import ThermometerBoard from './ThermometerBoard';
import CharacterPickTemplate from '../character/CharacterPickTeplate';
import ThermometerDonation from './ThermometerDonation';


export default function Thermometer(){
    const [stepData, setStepData] = useRecoilState(stepDataState)
    const [thermometerData, setThermometerData] = useRecoilState(thermometerDataState)
    const {step} = stepData;
    return(
        step === "thermometerBoard"
        ? <ThermometerBoard />
        : step === "thermometerCharacterPick"
        ? <CharacterPickTemplate type="thermometer"/>
        : <ThermometerDonation />

    )
    
}