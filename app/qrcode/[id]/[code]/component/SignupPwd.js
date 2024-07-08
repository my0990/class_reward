import AuthInput from "@/app/components/auth/components/authInput"
import AuthBtn from "@/app/components/auth/components/authBtn"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
export default function SignupPwd({ setStep, teacher, userId, userGender, userName }) {
    const [isLoading,setIsLoading] = useState(false);
    const MySwal = withReactContent(Swal)
    const router = useRouter();
    const pwdRef = useRef();
    const pwdCheckRef = useRef();
    const [error, setError] = useState({ pwd: '', pwdCheck: '' })
    const onClick = (e) => {
        e.preventDefault();
        if(isLoading){
            return
        } else {
            alert('아직 준비중입니다')
            return
            setIsLoading(true)
            if (!pwdRef.current.value) setError(prev => ({ pwd: "비밀번호를 입력하세요", pwdCheck: '' }))
            else if (pwdRef.current.value !== pwdCheckRef.current.value) setError(prev => ({ pwd: '', pwdCheck: "비밀번호가 일치하지 않습니다" }))
            else fetch("/api/studentSignup", {
                method: "POST",
                body: JSON.stringify({ userId: userId, teacher: teacher, password: pwdRef.current.value, userGender: userGender, userName: userName }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
    
                if (data.result === true) {
     
                    MySwal.fire({
                        title: '회원가입에 성공하였습니다. <br> 생성된 아이디로 로그인하여 주세요.',
                        text: '아이디: ' + userId,
                        icon: "success"
    
                        
                    }).then(() => router.replace('/'))
    
                } else {
                    alert('에러가 발생하였습니다. 처음부터 다시 시도하여 주십시오')
                    location.reload()
    
                }
            })
        }
        
    }
    return (
        <div>
            <div className="flex mt-[32px] flex-col items-center text-red-900">
                <div className="w-[400px] max-[400px]:w-[100%] h-[700px] bg-orange-200 rounded-3xl p-[24px]">
                    <div className="text-[1.5rem] font-bold flex items-center">
                        {/* <span className="cursor-pointer mr-[24px]">
                            <svg height="32px" version="1.1" viewBox="0 0 48 48" width="32px"  ><title /><desc /><g fill="none" fillRule="evenodd" id="Page-1" stroke="none" strokeWidth="1"><g id="Artboard-Copy" transform="translate(-107.000000, -729.000000)"><path d="M144.5396,753.9805 C145.9536,753.9785 146.9986,752.8735 147.000591,751.4765 C147.000591,750.0825 145.8296,749.0035 144.4146,749.0055 L123.7146,749.0315 L129.4776,743.3145 C130.4776,742.3245 130.4806,740.7245 129.4816,739.7385 C128.4836,738.7515 126.8626,738.7535 125.8626,739.7425 L115.8946,749.5855 L115.8256,749.6565 C115.3186,750.1195 115.000591,750.7815 115.000591,751.5135 C114.9986,752.2485 115.3136,752.9105 115.8206,753.3715 L115.8906,753.4395 L125.8356,763.2615 C126.8336,764.2485 128.4546,764.2465 129.4556,763.2555 C130.4566,762.2695 130.4576,760.6685 129.4596,759.6815 L123.8386,754.0035 L144.5396,753.9805 Z" fill="#7f1d1d" id="arrow2" /><g id="slices" transform="translate(47.000000, 9.000000)" /></g></g></svg>
                        </span> */}
                        <div className="flex">
                            <span className="rounded-full hover:scale-105 cursor-pointer " onClick={() => setStep(prev => prev - 1)}><svg height="32" viewBox="0 0 512 512" width="32" xmlns="http://www.w3.org/2000/svg"><title /><polyline points="244 400 100 256 244 112" style={{ fill: "none", stroke: "gray", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "48px" }} /><line style={{ fill: "none", stroke: "gray", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "48px" }} x1="120" x2="412" y1="256" y2="256" /></svg></span>
                            <div className="text-[1.5rem] font-bold ml-[8px]">비밀번호 입력</div>
                        </div>
                    </div>
                    {/* <div><span className="underline">아이디</span>는 인터넷에서 나를 나타내는 특별한 이름이에요. 마치 학교에서 친구들이 나를 이름으로 부르는 것처럼, 인터넷에서는 아이디로 나를 불러요.</div> */}

                    <div className="mt-[16px]">
                        <div className="mb-[8px]">로그인 할 때에 사용할 비밀번호를 입력해주세요</div>
                        <input className="focus:border-orange-500 border-2  mb-[8px] input input-bordered w-full  dark:placeholder:text-white dark:bg-gray-600" type="password" ref={pwdRef} autoComplete="off" placeholder="비밀번호를 입력해주세요" name="pwd" />
                        <input className="focus:border-orange-500 mb-[8px] border-2 input input-bordered w-full dark:placeholder:text-white dark:bg-gray-600" type="password" ref={pwdCheckRef} autoComplete="off" placeholder="비밀번호를 한번더 입력해주세요" name="pwdCheck" />
                        <div className="text-red-500 flex items-center justify-center">{error.pwd || error.pwdCheck}</div>
                    </div>
                    <AuthBtn className="text-blue-100 mb-[0px] mt-[8px]" onClick={onClick}>확인</AuthBtn>
                </div>

            </div>
        </div>
    )

}