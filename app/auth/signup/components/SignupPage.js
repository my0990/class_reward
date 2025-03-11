'use client'
import AuthInput from "../../components/authInput"
import AuthBtn from "../../components/authBtn"
import Link from "next/link"
import { useValidateForm } from "@/app/lib/useValidateForm"
export default function SignUpPage() {
    const specialCharPattern = /[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?~]/;
    const emojiPattern = /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}|\u{1FA70}-\u{1FAFF}|\u{2702}-\u{27B0}|\u{24C2}-\u{1F251}|\u{1F1E6}-\u{1F1FF}]/u;

    const onChange = (e) => {
        const { changeHandler, value, blurHandler } = getFieldProps(e.target.name);
        changeHandler(e);

    }
    const validate = (values) => {
        const errors = { id: "", pwd: "", pwdCheck: "", hasBlank: "", emoji: "" }

        if (!values.id) errors.id = "아이디를 입력하세요"
        if (specialCharPattern.test(values.id) || emojiPattern.test(values.id)) errors.emoji = "특수문자나 이모지 및 한글은 사용 불가능합니다"
        // if (!regExp.email.test(values.email)) errors.email = "이메일은 aws@snaps.com 형식으로 입력해주세요"
        if (!values.pwd) errors.pwd = "비밀번호를 입력하세요"
        // if (!regExp.pwd.test(values.pwd)) errors.pwd = "비밀번호는 8자 이상 영문, 숫자, 특수문자 조합으로 입력해주세요"
        if (!values.pwdCheck) errors.pwdCheck = "비밀번호를 입력해주세요"
        if (values.pwd !== values.pwdCheck) errors.pwdCheck = "비밀번호가 일치하지 않습니다"
        if (!values.code) errors.code = "선생님 코드를 입력하세요"
        if (values.code !== "말잇닿을련") errors.code = "선생님 코드를 정확히 입력하세요"
        if (values.id.includes(" ")) errors.hasBlank = "아이디에 공백이 있습니다"
        return errors
    }

    const { form, errors, isTouched, submitHandler, getFieldProps } = useValidateForm({
        initialForm: { id: "", pwd: "", pwdCheck: "", admin: true, code: "" },
        initialError: { id: "", pwd: "", pwdCheck: "", code: "", hasBlank: "", emoji: "" },
        initialIsTouched: { id: false, pwd: false, pwdCheck: false, code: "" },
        validate,
        type: 'register'
    });
    return(
        <div>
            <h1 className="text-orange-500 text-[2rem]">준비중입니다</h1>
            <div>2025년 3월 12일 공개예정</div>
        </div>
    )
    return (
        <form type="POST" onSubmit={submitHandler}>
            <div className="w-full flex flex-col items-center mt-[80px]">
                <div className="w-10/12 min-[500px]:w-[400px] mx-5 ">
                    <div className="text-[3rem] ">
                        선생님 회원가입
                    </div>
                    <div className="mb-5 text-[1.2rem] text-gray-400">
                        선생님만 가입해주세요
                    </div>
                    <AuthInput placeholder="아이디를 입력해주세요" name="id" onChange={onChange} />
                    <AuthInput placeholder="비밀번호를 입력해주세요" type="password" name="pwd" onChange={onChange} />
                    <AuthInput placeholder="비밀번호를 한번 더 입력해주세요" type="password" name="pwdCheck" onChange={onChange} />
                    <AuthInput placeholder="선생님 코드를 입력해주세요" name="code" onChange={onChange} />
                    <div className="text-red-500 text-center mb-[16px]">{errors.id || errors.emoji || errors.hasBlank || errors.pwd || errors.pwdCheck || errors.code}</div>
                    <AuthBtn className="text-blue-100 mb-[0px]">회원가입</AuthBtn>
                    <div className="flex flex-col w-full border-opacity-50">
                        <div className="divider">OR</div>
                    </div>
                    <Link href="../login/teacher"><button className={`btn btn-block bg-orange-500 dark:hover:bg-orange-300  mb-4 text-lg  border-0 text-white`}>로그인</button></Link>

                </div>
            </div>
        </form>
    )
}