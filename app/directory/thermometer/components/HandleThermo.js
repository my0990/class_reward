import { useState } from "react";
import { mutate } from "swr";
export default function ThermoDec({ thermoData, currencyName, type }) {
    const { requireCurrency } = thermoData;
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const onChagne = (e) => {
        const inputValue = e.target.value;
        const numberValue = Number(inputValue);
    
        if (/^\d*$/.test(numberValue)) {
            setAmount(inputValue); // 숫자만 상태에 저장
        } else {

        }

    }
    const onClose = () => {
        setAmount(0);
        document.getElementById('handleThermo').close();
    }

    const onSubmit = (e) => {
        if(!/^\d*$/.test(e.target.value)){
            alert('숫자만 입력해주세요')
            return
        }
        if (isLoading) {
            alert('처리중입니다.')
            return
        } else if (amount === 0 || typeof (parseInt(requireCurrency * amount)) === 'NaN') {
            alert('입력값을 확인해주세요')
            return
        }
        else {
            setIsLoading(true)
            fetch("/api/handleTemp", {
                method: "POST",
                body: JSON.stringify({  amount: Number(amount), type: type }),
                headers: {
                    "Content-Type": "application/json"
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    setAmount(0);
                    document.getElementById('handleThermo').close();

                    mutate(
                        "/api/fetchThermometerData",
                        (prev) => {
                            if(type === 'up'){
                                return {...prev, adjustment: prev.adjustment + Number(amount)}
                            } else {
                                return {...prev, adjustment: prev.adjustment - Number(amount)}
                            }
                            
                        },
                        false // 서버 요청 없이 즉시 반영
                    );
                    setIsLoading(false)
                } 
            })
        }

    }
    return (
        <dialog id="handleThermo" className="modal  modal-middle ">
            <div className="modal-box bg-orange-200">
                <div className="flex relative mt-[16px] h-[40px]">
                    <input type="text"  value={amount === 0 ? "" : amount} onChange={onChagne} className="border-2 pl-[32px] h-full rounded-lg border-orange-300 outline-none focus:border-orange-500 text-right w-[100px] pr-[8px] mr-[8px]" ></input>
                    <div className="h-full text-[1.5rem]">도를 {type === "up" ? "올립니다" : "내립니다"}</div>
                    <div className="w-[24px] h-[40px] flex items-center ml-[4px]">
                        {type === "up"
                        ?   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9.01 9.01 0 0 1-9 9zM8 11V9a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0zm8-2v2a1 1 0 0 1-2 0V9a1 1 0 0 1 2 0zm-8 5h8a4 4 0 0 1-8 0z" /></svg>
                        :  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 11V9a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0zm7 1a1 1 0 0 0 1-1V9a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1zm-3 2a6.036 6.036 0 0 0-4.775 2.368 1 1 0 1 0 1.55 1.264 4 4 0 0 1 6.45 0 1 1 0 0 0 1.55-1.264A6.036 6.036 0 0 0 12 14zm11-2A11 11 0 1 1 12 1a11.013 11.013 0 0 1 11 11zm-2 0a9 9 0 1 0-9 9 9.01 9.01 0 0 0 9-9z" /></svg>}
                    </div>
                </div>
                <div className="text-[1.5rem]">
                    &#40;=	{requireCurrency * amount} {currencyName}&#41;
                </div>
                <div className="h-[40px] text-[1.1rem] text-end mt-[8px]">
                    <button onClick={onSubmit} className=" bg-red-500 text-white mr-[8px] h-full rounded-lg px-[16px] hover:bg-red-600" >확인</button>
                    <button onClick={onClose} className=" bg-red-500 text-white mr-[8px] h-full rounded-lg px-[16px] hover:bg-red-600" >취소</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button>close</button>
            </form>
        </dialog>
    )
}