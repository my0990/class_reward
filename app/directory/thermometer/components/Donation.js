import { useState } from "react"

export default function Dontaion({ userData, classData, thermoData }) {
    const [amount, setAmount] = useState("");
    const [isLoading,setIsLoading] = useState(false);
    const onChange = (e) => {
        if (/^\d*$/.test(e.target.value)) {

            if (e.target.value < userData.money) {


                setAmount(e.target.value)
            } else {
                setAmount(userData.money)
            }
        }

    }
    const onClose = () => {
        setAmount("");

    }

    const onSubmit = (e) => {
        e.preventDefault();
        if(isNaN(Number(parseInt(amount).toFixed(1))) || Number(amount) === 0){
            alert('입력값을 확인해주세요')
            return;
        }
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/setDonation", {
                method: "POST",
                body: JSON.stringify({ amount: Number(parseInt(amount).toFixed(1)), userId: userData.userId, money: userData?.money }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    alert("기부하였습니다");
                    setAmount('')
                    document.getElementById('donation').close()
                    
                }
            })
        }
        setIsLoading(false)
    }
    return (
        <div>
            <dialog id="donation" className="modal">
                <div className="modal-box bg-orange-200 overflow-hidden flex w-[400px] justify-center flex-col items-center text-[1.5rem]">
                    <div className="bg-orange-200  rounded-lg w-full">
                        <div className="flex justify-between ">
                            <div>{userData?.profileNickname + '(' + userData?.userId + ')'}</div>
                            <div>{classData?.currencyEmoji} {userData?.money}</div>
                        </div>
                        <div className="mt-[16px] flex justify-end text-[1.5rem]">
                            <input type="number" className="max-w-[120px] text-right border-b-2 border-black px-[8px] min-w-[32px] outline-none bg-orange-200" onChange={onChange} value={amount} />{classData.currencyName} 기부하기
                        </div>
                        <div className="text-right text-[1.2rem] text-red-500 mt-[4px]">약 {amount/thermoData.requireCurrency}도 상승</div>
                        <div className="mt-[8px]">
                        </div>
                        <div className="flex justify-center flex-col">
                            <button onClick={onSubmit} className="bg-red-500 rounded-lg mr-[8px] px-[16px] py-[8px] w-full mt-[16px] hover:bg-red-400 text-[1rem] text-white">확인</button>
                            <button className="bg-gray-400 rounded-lg px-[16px] py-[8px] w-full mt-[8px] hover:bg-gray-300 text-[1rem] text-white">취소</button>
                        </div>
                        <div className="text-center text-red-500 text-[1.2rem] mt-[8px]"></div>
                    </div>
                    <div className="invisible h-0 inline-block px-[8px]" >{amount}</div>

                </div>
                <form method="dialog" className="modal-backdrop" onClick={onClose}>
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}