import { useRef, useState, useEffect } from "react";
export default function CheckPwdModal({ requestData, setIsPwdChecked}) {
    const [isLoading, setIsLoading] = useState(false);
    console.log(requestData)
    // {
    //     data: {
    //       requestItemData: {
    //         itemId: '667cb2aa13782ba6f19de623',
    //         itemPrice: 1500,
    //         itemName: '운동장 이용권',
    //         itemQuantity: 5,
    //         itemExplanation: '점심 시간에 운동장을 이용할 수 있다(3명 같이)'
    //       },
    //       requestUserId: 'HAMIN'
    //     }
    //   }
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
                    setIsPwdChecked(true);

                } else {
                    alert('비밀번호를 다시 확인해주세요')
                    document.getElementById('my_modal_3').close()
                    setIsLoading(false)
                    onCloseModal()
                }
            })
        }

    }
    const pwdRef = useRef();
    useEffect(()=>{
        pwdRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    },[])

    return (
        <dialog id="my_modal_3" className="modal  modal-middle">
            <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200 flex flex-col">
                <div className="text-[2rem]">선택된 사용자: <span className="bg-orange-200">{requestData.userName}</span></div>
                {/* <div className="text-[1.5rem]">로그인 비밀번호를 입력해주세요</div> */}
                <input type="password" ref={pwdRef} className="input input-bordered input-warning my-[16px]" placeholder="로그인 비밀번호를 입력해주세요" autoComplete='off'></input>
                <button onClick={onClick} className="btn text-[1.3rem] bg-orange-500 text-white mt-[8px]">확인</button>
            </div>

            <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
                <button>close</button>
            </form>

        </dialog>

    )
}