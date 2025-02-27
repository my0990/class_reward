import { useRef, useState, useEffect } from "react";
import Alert from "../Alert";

export default function CheckPwdModal({ type, requestData, setRequestData }) {
    const [isLoading,setIsLoading] = useState(false)

    const onCloseModal = () => {
        pwdRef.current.value = ""

        document.getElementById('my_modal_3').close()

    }
    const onClick = (e) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/checkPwd", {
                method: "POST",
                body: JSON.stringify({ userId: requestData.userData.userId, userPwd: pwdRef.current.value }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    if (type === "buy") {
                        setRequestData(prev => ({...prev, step: "confirmItemBuy"}))
                    } else if(type === "use") {
                        setRequestData(prev => ({...prev, step: "confirmItemUse"}))
                    } else {
                        setRequestData(prev => ({...prev, step: "confirmThermometer"}))
                    }


                } else {
                    document.getElementById('my_modal_2').showModal()
                    pwdRef.current.value = ""
                    setIsLoading(false)
                    // onCloseModal()
                }
            })
        }

    }
    const pwdRef = useRef();
    useEffect(() => {
        pwdRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [])
    const onModalFinish = () => {
        document.getElementById('my_modal_2').close()
    }

    return (
        <dialog id="my_modal_3" className="modal  modal-middle">
            <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200 flex flex-col">
                <div className="text-[2rem]">선택된 사용자: <span className="bg-orange-200">{requestData.userData.classNumber}. {requestData.userData.profileNickname}</span></div>
                <input type="password" ref={pwdRef} className="input input-bordered input-warning my-[16px]" placeholder="로그인 비밀번호를 입력해주세요" autoComplete='off'></input>
                <button onClick={onClick} className="btn text-[1.3rem] bg-orange-500 text-white mt-[8px]">확인</button>
            </div>

            <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
                <button>close</button>
            </form>
            <Alert onModalFinish={onModalFinish}>비밀번호를 확인해주세요</Alert>
        </dialog>

    )
}