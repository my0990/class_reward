import { useRef, useState, useEffect } from "react";
import Alert from "../Alert";
import {stepDataState, requestDataState,} from '@/store/atoms';
import { useRecoilState } from 'recoil';
export default function CheckPwdModal({ type }) {
    const [requestData, setRequestData] = useRecoilState(requestDataState);
    const [stepData, setStepData] = useRecoilState(stepDataState);
    const [isLoading, setIsLoading] = useState(false);

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
                body: JSON.stringify({ userId: requestData.userId, userPwd: pwdRef.current.value }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    if (type === "buy") {
                        setStepData({ menu: "buy", step: 'confirmBuy' })
                    } else if(type === "use") {
                        setStepData({ menu: "use", step: 'useItemPick' })
                    } else {
                        setStepData({menu: "thermometer", step: 'thermometerDonation'})
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
                <div className="text-[2rem]">선택된 사용자: <span className="bg-orange-200">{requestData.userNumber}. {requestData.userNickname}</span></div>
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