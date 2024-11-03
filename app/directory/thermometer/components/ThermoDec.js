import { useState } from "react";
export default function ThermoDec({ thermoInfo, currencyName, userId }) {
    const { requireCurrency } = thermoInfo;
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const onChagne = (e) => {

        console.log(amount)
        const inputValue = e.target.value;
        const numberValue = Number(inputValue);
    
        if (!Number.isNaN(numberValue)) {
            setAmount(inputValue); // 숫자만 상태에 저장
        } else {
          console.log("Invalid input: NaN");
        }

    }
    const onClose = () => {
        setAmount(0);
        document.getElementById('dec').close();
    }

    const onSubmit = (e) => {

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
                body: JSON.stringify({ userId: userId, amount: amount, type: "down" }),
                headers: {
                    "Content-Type": "application/json"
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    alert('완료하였습니다');
                    location.reload();
                } else {
                    setIsLoading(false)
                }
            })
        }

    }
    return (
        <dialog id="dec" className="modal  modal-middle ">
            <div className="modal-box bg-orange-200">

                <div className="flex relative mt-[16px] h-[40px]">
                    <input type="text"  value={amount === 0 ? "" : amount} onChange={onChagne} className="border-2 pl-[32px] h-full rounded-lg border-orange-300 outline-none focus:border-orange-500 text-right w-[100px] pr-[8px] mr-[8px]" ></input>
                    <div className="h-full text-[1.5rem]">도를 내립니다</div>
                    <div className="w-[24px] h-[40px] flex items-center ml-[4px]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 11V9a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0zm7 1a1 1 0 0 0 1-1V9a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1zm-3 2a6.036 6.036 0 0 0-4.775 2.368 1 1 0 1 0 1.55 1.264 4 4 0 0 1 6.45 0 1 1 0 0 0 1.55-1.264A6.036 6.036 0 0 0 12 14zm11-2A11 11 0 1 1 12 1a11.013 11.013 0 0 1 11 11zm-2 0a9 9 0 1 0-9 9 9.01 9.01 0 0 0 9-9z" /></svg>
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