'use client'
import AuthInput from "./components/authInput"
import AuthBtn from "./components/authBtn"
import Link from "next/link"
import { useValidateForm } from "@/app/lib/useValidateForm"
export default function SignUpPage(){
    const onChange = (e) => {
        const {changeHandler, value, blurHandler} = getFieldProps(e.target.name);
        changeHandler(e);

    }
    const validate = (values) => {
        const errors = { id: "", pwd: "", pwdCheck: "", name: "", hasBlank: "" }
        
        if (!values.id) errors.id = "아이디를 입력하세요"
        // if (!regExp.email.test(values.email)) errors.email = "이메일은 aws@snaps.com 형식으로 입력해주세요"
        if (!values.pwd) errors.pwd = "비밀번호를 입력하세요"
        // if (!regExp.pwd.test(values.pwd)) errors.pwd = "비밀번호는 8자 이상 영문, 숫자, 특수문자 조합으로 입력해주세요"
        if (!values.pwdCheck) errors.pwdCheck = "비밀번호를 입력해주세요"
        if (values.pwd !== values.pwdCheck) errors.pwdCheck = "비밀번호가 일치하지 않습니다"
        if (!values.name) errors.name = "이름을 입력하세요"
        if (!values.code) errors.code = "선생님 코드를 입력하세요"
        if (values.code !== "말잇닿을련") errors.code = "선생님 코드를 정확히 입력하세요"
        if (values.id.includes(" ")) errors.hasBlank = "아이디에 공백이 있습니다"
        return errors
      }

    const { form, errors, isTouched, submitHandler, getFieldProps } = useValidateForm({
    initialForm: { id: "", pwd: "", pwdCheck: "", name: "", admin: true, code: "" },
    initialError: { id: "", pwd: "", pwdCheck: "", name: "", code: "", hasBlank: ""  },
    initialIsTouched: { id: false, pwd: false, pwdCheck: false, name: false, code: "" },
    validate,
    type: 'register'
    });

    return(
        <form type="POST" onSubmit={submitHandler}>
            <div className="w-full flex flex-col items-center mt-[80px]">
                <div className="w-10/12 min-[500px]:w-[400px] mx-5 ">
                    <div className="text-[3rem] ">
                        선생님 회원가입
                    </div>
                    <div className="mb-5 text-[1.2rem] text-gray-400">
                        선생님만 가입해주세요
                    </div>
                    <AuthInput placeholder="이름을 입력해주세요" name="name" onChange={onChange}/>
                    <AuthInput placeholder="아이디를 입력해주세요" name="id" onChange={onChange}/>
                    <AuthInput placeholder="비밀번호를 입력해주세요" type="password" name="pwd" onChange={onChange}/>
                    <AuthInput placeholder="비밀번호를 한번 더 입력해주세요" type="password" name="pwdCheck" onChange={onChange}/>
                    <AuthInput placeholder="선생님 코드를 입력해주세요" name="code"  onChange={onChange}/>
                    <div className="text-red-500 text-center mb-[16px]">{errors.name || errors.id ||errors.hasBlank ||  errors.pwd || errors.pwdCheck || errors.code }</div>
                    <AuthBtn className="text-blue-100 mb-[0px]">회원가입</AuthBtn>
                    <div className="flex flex-col w-full border-opacity-50">
                        <div className="divider">OR</div>
                    </div>
                    <Link href="../"><button className={`btn btn-block bg-orange-500 dark:hover:bg-orange-300  mb-4 text-lg  border-0 text-white`}>로그인</button></Link>
                </div>
            </div>
        </form>
    )
}