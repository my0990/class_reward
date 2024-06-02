'use client'
import AuthInput from "@/app/components/auth/components/authInput"
import AuthBtn from "@/app/components/auth/components/authBtn"
import { useState } from "react"
import { useValidateForm } from "@/app/lib/useValidateForm"
import Image from "next/image"
import female from "@/public/female.png"
import male from "@/public/male.png"
export default function StudentSignupTemplate({ id, code }) {

    const [gender,setGender] = useState('');
    const onChange = (e) => {
        const { changeHandler, value, blurHandler } = getFieldProps(e.target.name);
        changeHandler(e);
 
    }
    const onGenderChange = (e) => {
        onChange(e);
        setGender(e.target.value)

    }
    const validate = (values) => {
        const errors = { id: "", pwd: "", pwdCheck: "", name: "", teacher: "", nickname: "", admin: false, gender: ""}

        if (!values.id) errors.id = "아이디를 입력하세요"
        // if (!regExp.email.test(values.email)) errors.email = "이메일은 aws@snaps.com 형식으로 입력해주세요"
        if (!values.pwd) errors.pwd = "비밀번호를 입력하세요"
        // if (!regExp.pwd.test(values.pwd)) errors.pwd = "비밀번호는 8자 이상 영문, 숫자, 특수문자 조합으로 입력해주세요"
        if (!values.pwdCheck) errors.pwdCheck = "비밀번호를 입력해주세요"
        if (values.pwd !== values.pwdCheck) errors.pwdCheck = "비밀번호가 일치하지 않습니다"
        if (!values.name) errors.name = "이름을 입력하세요"
        if (!values.nickname) errors.nickname = "별명을 입력하세요"
        if (!values.gender) errors.gender = "성별을 선택해주세요"


        return errors
    }

    const { form, errors, isTouched, submitHandler, getFieldProps } = useValidateForm({
        initialForm: { id: "", pwd: "", pwdCheck: "", name: "", admin: false, nickname: "", teacher: id, gender: "" },
        initialError: { id: "", pwd: "", pwdCheck: "", name: "", admin: false, nickname: "", teacher: "", gender: "" },
        initialIsTouched: { id: false, pwd: false, pwdCheck: false, name: false, gender: false },
        validate,
        type: 'register'
    });

    return (
        <form type="POST" onSubmit={submitHandler}>
            <div className="w-full flex flex-col items-center mt-[40px]">
                <div className="w-10/12 min-[500px]:w-[400px] mx-5 ">
                    <div className="text-[3rem] mb-5">
                        학생 회원가입
                    </div>

                    <AuthInput placeholder="이름을 입력해주세요" name="name" onChange={onChange} />
                    <AuthInput placeholder="아이디를 입력해주세요" name="id" onChange={onChange} />
                    <AuthInput placeholder="별명을 입력해주세요" name="nickname" onChange={onChange} />
                    <AuthInput placeholder="비밀번호를 입력해주세요" type="password" name="pwd" onChange={onChange} />
                    <AuthInput placeholder="비밀번호를 한번 더 입력해주세요" type="password" name="pwdCheck" onChange={onChange} />

                    <div className="">
                        <div className="flex justify-evenly  py-[16px]">
                            <div className={`border-4 ${gender === "male" ? " border-orange-500" : null}`}>
                                <label for="male" >
                                <div className="border-4 w-[120px] h-[160px] relative cursor-pointer">
                                    <Image src={male} alt="character" fill={true} priority={true} />
                                </div>
                                <div className="text-center">남학생</div>
                                </label>
                                <input type="checkbox" id="male" name="gender" className="hidden" onChange={onGenderChange} value="male"/>
                            </div>
                            <div className={`border-4 ${gender === "female" ? " border-orange-500" : null}`}>
                                <label for="female">
                                <div className="border-4 w-[120px] h-[160px] relative cursor-pointer">
                                    <Image src={female} alt="character" fill={true} priority={true} />
                                </div>
                                <div className="text-center">여학생</div>
                                </label>
                                <input type="checkbox" id="female" name="gender" className="hidden" onChange={onGenderChange} value="female"/>
                            </div>
                        </div>
                    </div>
                    <div className="text-red-500 text-center mb-[16px]">{errors.name || errors.id || errors.nickname || errors.pwd || errors.pwdCheck || errors.gender}</div>
                    <AuthBtn className="text-blue-100 mb-[0px]">회원가입</AuthBtn>

                    {/* <div className="flex flex-col w-full border-opacity-50">
                        <div className="divider">OR</div>
                    </div>
                    <Link href="../../"><button className={`btn btn-block bg-orange-500 dark:hover:bg-orange-300  mb-4 text-lg  border-0 text-white`}>로그인</button></Link> */}
                </div>
            </div>
        </form>
    )
}