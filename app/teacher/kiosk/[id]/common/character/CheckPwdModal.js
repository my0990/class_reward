import { useRef, useState, useEffect } from "react";
import { checkKioskPassword } from "@/server-action/actions/kiosk/kiosk.action";


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
            // 비밀번호가 맞으면 서버가 이 학생 전용 결제 토큰(kioskToken, 3분 유효)을 준다.
            // 다음 단계의 구매/사용 요청에 이 토큰을 같이 보내야 처리된다.
            checkKioskPassword({ userId: requestData.userData.userId, userPwd: pwdRef.current.value }).then((data) => {

                if (data?.result === true) {
                    const kioskToken = data.kioskToken
                    if (type === "buy") {
                        setRequestData(prev => ({...prev, kioskToken, step: "confirmItemBuy"}))
                    } else if(type === "use") {
                        setRequestData(prev => ({...prev, kioskToken, step: "confirmItemUse"}))
                    } else {
                        setRequestData(prev => ({...prev, kioskToken, step: "confirmThermometer"}))
                    }


                } else {
                    alert(data?.message || '비밀번호를 확인해주세요')
                    pwdRef.current.value = ""
                    setIsLoading(false)
                }
            }).catch(() => {
                alert('비밀번호 확인 중 오류가 발생했습니다.')
                setIsLoading(false)
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
            {/* <Alert onModalFinish={onModalFinish}>비밀번호를 확인해주세요</Alert> */}
        </dialog>

    )
}