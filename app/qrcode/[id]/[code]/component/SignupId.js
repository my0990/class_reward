import AuthInput from "@/app/components/auth/components/authInput"
import AuthBtn from "@/app/components/auth/components/authBtn"
import { useState, useRef } from "react"
export default function SignupId({ onChange, setStep }) {
    const [error, setError] = useState({ id: '', hasBlank: '', idExist: '' });
    const onClick = () => {

        if (!idRef.current.value) setError(prev => ({  hasBlank: '', idExist: '' , id: "아이디를 입력하세요" }))
        else if (idRef.current.value.includes(" ")) setError(prev => ({ idExist: '' , id: "", hasBlank: "아이디에 공백이 있습니다" }))
        else fetch("/api/checkId", {
            method: "POST",
            body: JSON.stringify({ userId: idRef.current.value }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).catch(err => {console.log(err)}).then((data) => {

            if (data.result === true) {
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
                    <div className="text-[1.5rem] font-bold ">아이디 입력</div>
                    {/* <div><span className="underline">아이디</span>는 인터넷에서 나를 나타내는 특별한 이름이에요. 마치 학교에서 친구들이 나를 이름으로 부르는 것처럼, 인터넷에서는 아이디로 나를 불러요.</div> */}

                    <div className="mt-[16px]">
                        <div className="mb-[16px]">로그인 할 때에 사용할 아이디를 입력해주세요</div>
                        <input className="mb-[8px] focus:border-orange-500 border-2 input input-bordered w-full  dark:placeholder:text-white dark:bg-gray-600" ref={idRef} autoComplete="off" placeholder="아이디를 입력해주세요" name="id" onChange={onChange} />
                        {Object.values(error).some(obj => Boolean(obj)) ? <div className=" text-red-500 h-[24px] flex items-center justify-center">{error.id || error.hasBlank || error.idExist}</div> : null}
                    </div>
                    <AuthBtn className="text-blue-100 mb-[0px] mt-[8px]" onClick={onClick}>다음</AuthBtn>
                </div>

            </div>
        </div>
    )

}