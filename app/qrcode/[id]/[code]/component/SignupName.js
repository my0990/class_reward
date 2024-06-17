import AuthInput from "@/app/components/auth/components/authInput"
import AuthBtn from "@/app/components/auth/components/authBtn"
import { useState, useRef } from "react"
export default function SignupName({ setStep, setUserName }) {
    const [error, setError] = useState({ id: '', hasBlank: '', idExist: '' });
    const onClick = (e) => {
        e.preventDefault();
        if (!nameRef.current.value) setError(prev => ({ name: "이름을 입력하세요" }))
        else {
            setUserName(nameRef.current.value)
            setStep(prev => prev + 1)
        }

    }
    const nameRef = useRef();
    return (
        <div>
            <div className="flex mt-[32px] flex-col items-center text-red-900">
                <div className="w-[400px] max-[400px]:w-[100%] h-[700px] bg-orange-200 rounded-3xl p-[24px]">
                    <div className="flex">
                        <span className="rounded-full hover:scale-105 cursor-pointer " onClick={() => setStep(prev => prev - 1)}><svg height="32" viewBox="0 0 512 512" width="32" xmlns="http://www.w3.org/2000/svg"><title /><polyline points="244 400 100 256 244 112" style={{ fill: "none", stroke: "gray", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "48px" }} /><line style={{ fill: "none", stroke: "gray", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "48px" }} x1="120" x2="412" y1="256" y2="256" /></svg></span>
                        <div className="text-[1.5rem] font-bold ml-[8px]">이름 입력</div>
                    </div>
                    {/* <div><span className="underline">아이디</span>는 인터넷에서 나를 나타내는 특별한 이름이에요. 마치 학교에서 친구들이 나를 이름으로 부르는 것처럼, 인터넷에서는 아이디로 나를 불러요.</div> */}

                    <div className="mt-[16px]">
                        <div className="mb-[16px]">성과 이름을 모두 입력해주세요 예&#41; 홍길동</div>
                        <input className="mb-[8px] focus:border-orange-500 border-2 input input-bordered w-full  dark:placeholder:text-white dark:bg-gray-600" ref={nameRef} autoComplete="off" placeholder="이름을 입력해 주세요" name="name" />
                        {Object.values(error).some(obj => Boolean(obj)) ? <div className=" text-red-500 h-[24px] flex items-center justify-center">{error.name}</div> : null}
                    </div>
                    <AuthBtn className="text-blue-100 mb-[0px] mt-[8px]" onClick={onClick}>다음</AuthBtn>
                </div>

            </div>
        </div>
    )

}