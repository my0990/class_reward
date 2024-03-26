'use client'
import AuthInput from "@/app/components/auth/components/authInput"
import AuthBtn from "@/app/components/auth/components/authBtn"
import { useState } from "react"
import { useValidateForm } from "@/app/lib/useValidateForm"
export default function SignUpPage({params}){
    const {id} = params
    const onChange = (e) => {
        const {changeHandler, value, blurHandler} = getFieldProps(e.target.name);
        changeHandler(e);
    }
    const validate = (values) => {
        const errors = { id: "", pwd: "", pwdCheck: "", name: "" }
        
        if (!values.id) errors.id = "아이디를 입력하세요"
        // if (!regExp.email.test(values.email)) errors.email = "이메일은 aws@snaps.com 형식으로 입력해주세요"
        if (!values.pwd) errors.pwd = "비밀번호를 입력하세요"
        // if (!regExp.pwd.test(values.pwd)) errors.pwd = "비밀번호는 8자 이상 영문, 숫자, 특수문자 조합으로 입력해주세요"
        if (!values.pwdCheck) errors.pwdCheck = "비밀번호를 입력해주세요"
        if (values.pwd !== values.pwdCheck) errors.pwdCheck = "비밀번호가 일치하지 않습니다"
        if (!values.name) errors.name = "이름을 입력하세요"

    
        return errors
      }
    console.log(id)
    const { form, errors, isTouched, submitHandler, getFieldProps } = useValidateForm({
    initialForm: { id: "", pwd: "", pwdCheck: "", name: "" , admin: false, teacher: id},
    initialError: { id: "", pwd: "", pwdCheck: "", name: ""  },
    initialIsTouched: { id: false, pwd: false, pwdCheck: false, name: false },
    validate,
    type: 'register'
    });

    return(
        <form type="POST" onSubmit={submitHandler}>
            <div className="w-full flex flex-col items-center mt-[80px]">
                <div className="w-10/12 min-[500px]:w-[400px] mx-5 ">
                    <div className="text-[3rem] mb-5">
                        회원가입
                    </div>
                    <AuthInput placeholder="이름을 입력해주세요" name="name" onChange={onChange}/>
                    <AuthInput placeholder="아이디를 입력해주세요" name="id" onChange={onChange}/>
                    <AuthInput placeholder="비밀번호를 입력해주세요" name="pwd" onChange={onChange}/>
                    <AuthInput placeholder="비밀번호를 한번 더 입력해주세요" name="pwdCheck" onChange={onChange}/>
                    <AuthBtn className="text-blue-100 mb-[0px]">회원가입</AuthBtn>
                    <div className="flex flex-col w-full border-opacity-50">
                        <div className="divider">OR</div>
                    </div>
                    <div className="text-red-200">{errors.pwd}</div>
                    <AuthBtn className="text-blue-100">로그인</AuthBtn>
                </div>
            </div>
        </form>
    )
}