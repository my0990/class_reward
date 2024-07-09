
export default function KioskHomeTemplate({ setStep, enterFullscreen }) {



    return (
        <div className="flex flex-col justify-center items-center h-[100vh] text-[1.5rem] bg-orange-100 relative" >
            <div className="flex items-center mb-[24px]"><div className="rounded-full mr-[8px] text-white  bg-orange-500 w-[40px] h-[40px] flex justify-center items-center">뀰</div> kiosk</div>
            <button onClick={() => setStep('buy')} className="btn mb-[16px] px-[24px]">아이템 구매하기</button>
            <button onClick={() => setStep('use')} className="btn px-[24px]">아이템 사용하기</button>
            <button onClick={enterFullscreen} className="btn px-[24px] absolute top-0 right-0 opacity-50 hover:opacity-100" >전체 <br></br>화면</button>
        </div>
    )
}