import AuthInput from "@/app/components/auth/components/authInput"
import AuthBtn from "@/app/components/auth/components/authBtn"
import { useState, useRef } from "react"

export default function SignupId({ onChange, setStep, setUserId }) {
    const [error, setError] = useState({ id: '', hasBlank: '', idExist: '' });

    const specialCharPattern = /[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?~]/;
    const emojiPattern = /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}|\u{1FA70}-\u{1FAFF}|\u{2702}-\u{27B0}|\u{24C2}-\u{1F251}|\u{1F1E6}-\u{1F1FF}]/u;
    const onClick = (e) => {
        e.preventDefault();
        if (!idRef.current.value) setError(prev => ({ hasBlank: '', idExist: '', id: "아이디를 입력하세요", emoji: '' }))
        else if (idRef.current.value.includes(" ")) setError(prev => ({ idExist: '', id: "", hasBlank: "아이디에 공백이 있습니다", emoji: '' }))
        else if (specialCharPattern.test(idRef.current.value) || emojiPattern.test(idRef.current.value)) setError(prev => ({ idExist: '', id: "", hasBlank: "", emoji: '특수문자나 이모지, 한글은 사용 불가합니다' }))
        else fetch("/api/checkId", {
            method: "POST",
            body: JSON.stringify({ userId: idRef.current.value }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {

            if (data.result === true) {
                setUserId(idRef.current.value)
                setStep(prev => prev + 1)
            } else {

                setError(prev => ({ id: '', hasBlank: '', idExist: "이미 존재하는 아이디입니다" }))
            }
        })
    }
    const idRef = useRef();
    return (
        <div>
            <div className="flex mt-[32px] flex-col items-center text-red-900">
                <div className="w-[400px] max-[400px]:w-[100%] h-[700px] bg-orange-200 rounded-3xl p-[24px]">
                    <div className="text-[1.5rem] font-bold flex items-center">
                    
                        <div className="ml-[8px] ">아이디 입력</div>

                    </div>
                    {/* <div><span className="underline">아이디</span>는 인터넷에서 나를 나타내는 특별한 이름이에요. 마치 학교에서 친구들이 나를 이름으로 부르는 것처럼, 인터넷에서는 아이디로 나를 불러요.</div> */}

                    <div className="mt-[16px]">
                        <div className="mb-[16px]">로그인 할 때에 사용할 아이디를 입력해주세요</div>
                        <input className="mb-[8px] focus:border-orange-500 border-2 input input-bordered w-full  dark:placeholder:text-white dark:bg-gray-600" ref={idRef} autoComplete="off" placeholder="아이디를 입력해주세요" name="id" onChange={onChange} />
                        {Object.values(error).some(obj => Boolean(obj)) ? <div className=" text-red-500 h-[24px] flex items-center justify-center">{error.id || error.hasBlank || error.idExist || error.emoji}</div> : null}
                    </div>
                    <AuthBtn className="text-blue-100 mb-[0px] mt-[8px]" onClick={onClick}>다음</AuthBtn>
                </div>

            </div>
        </div>
    )

}