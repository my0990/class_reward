import { useRecoilState } from 'recoil';
import { thermometerDataState, userDataState, stepDataState } from '@/store/atoms';

export default function KioskHomeTemplate({ enterFullscreen }) {

    const [stepData, setStepData] = useRecoilState(stepDataState);
    const [thermometerData, setThermometerData] = useRecoilState(thermometerDataState)
    return (
        <div className="flex flex-col justify-center items-center h-[100vh] text-[1.5rem] bg-orange-100 relative overflow-hidden" >
            <div className="flex items-center mb-[24px]"><div className="rounded-full mr-[8px] text-white  bg-orange-500 w-[40px] h-[40px] flex justify-center items-center">뀰</div> kiosk</div>
            <button onClick={() => setStepData({ menu: "buy", step: "buyItemPick" })} className="btn mb-[16px] px-[24px] w-[140px]">아이템 구매하기</button>
            <button onClick={() => setStepData({ menu: "use", step: "useCharacterPick" })} className="btn mb-[16px] px-[24px] w-[140px]">아이템 사용하기</button>
            {thermometerData !== null
                ? <button onClick={() => setStepData({ menu: "thermometer", step: "thermometerBoard" })} className="btn px-[12px] w-[140px]"><span className="text-[1.5rem]">🌡️</span> 학급 온도계</button>
                : <button  className="hover:cursor-default opacity-50 hover:bg-gray-100 hover:border-0 outline-none btn  w-[140px]"><span className="text-[1.5rem]">🌡️</span> 학급 온도계</button>}
            <button onClick={enterFullscreen} className="btn px-[24px] absolute top-0 right-0 opacity-50 hover:opacity-100" >전체 <br></br>화면</button>
        </div>
    )
}