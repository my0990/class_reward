'use client'
import AuthInput from "./components/authInput"
import AuthBtn from "./components/authBtn"
import { useValidateForm } from "@/app/lib/useValidateForm"
import { useRouter } from "next/navigation"
import lottieJson from "@/public/tangerine.json"
import dynamic from 'next/dynamic';
import Typewriter from 'typewriter-effect';
import Link from "next/link"
export default function AuthPage() {
    const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });
    const onChange = (e) => {
        const { changeHandler, value, blurHandler } = getFieldProps(e.target.name);
        changeHandler(e);
    }
    const validate = (values) => {
        const errors = { id: "", pwd: "", pwdCheck: "" }

        if (!values.id) errors.id = "아이디를 입력하세요"
        if (!values.pwd) errors.pwd = "비밀번호를 입력하세요"
        return errors
    }

    const { form, errors, isTouched, submitHandler, getFieldProps } = useValidateForm({
        initialForm: { id: "", pwd: "" },
        initialError: { id: "", pwd: "" },
        initialIsTouched: { id: false, pwd: false, },
        validate,
        type: 'logIn'
    });

    const route = useRouter();



    return (
        <form type="POST" onSubmit={submitHandler}>
            <div className="w-full h-screen flex flex-col items-center justify-center">
                <div className="w-10/12 min-[500px]:w-[400px] mx-5 ">
                    <div className="text-[1.8rem] min-[500px]:text-[2rem] text-center caret-orange-500">
                        <Typewriter
                            options={{
                                strings: ['안녕하세요', '학급 보상 관리 시스템', '[뀰]입니다','...........', '뀰!!!!!!!'],
                                autoStart: true,
                                wrapperClassName: "typeWriter",
                                cursorClassName: "typeWriterCursor",
                                loop: true,
                            }}

                        />
                    </div>
                    <div className="relative w-[80vw] h-[80vw]  min-[400px]:w-[300px] min-[400px]:h-[300px] overflow-hidden border-orange-400  mx-auto rounded-full flex items-center justify-center">
                        <div className="absolute min-[500px]:w-[500px] min-[500px]:h-[500px] w-[400px] ">
                            <Lottie
                                loop
                                animationData={lottieJson}
                                play
                            />
                        </div>

                    </div>
                    <AuthInput placeholder="아이디를 입력해주세요" name="id" onChange={onChange} />
                    <AuthInput placeholder="비밀번호를 입력해주세요" name="pwd" type="password" onChange={onChange} />
                    {errors.id || errors.pwd ? <div className="text-red-500 text-center mb-3">{errors.id || errors.pwd}</div> : null }
                    <AuthBtn className="text-blue-100 mb-[0px]" type="submit">로그인</AuthBtn>
                    {/* <div className="flex flex-col w-full border-opacity-50">
                        <div className="divider dark:before:bg-white dark:after:bg-white dark:text-white">OR</div>
                    </div>
                    <AuthBtn className="text-blue-100" type="button" onClick={() => route.push("./signup")}>회원가입</AuthBtn> */}
                    <div className="text-center mt-[8px]">아이디가 없으세요? <Link href="/signup"><span className="text-orange-500 cursor-pointer hover:underline">회원가입</span></Link></div>
                </div>
            </div>
        </form>

    )
}
