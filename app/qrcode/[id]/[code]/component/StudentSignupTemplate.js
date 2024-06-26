'use client'
import AuthInput from "@/app/components/auth/components/authInput"
import AuthBtn from "@/app/components/auth/components/authBtn"
import { useState } from "react"
import { useValidateForm } from "@/app/lib/useValidateForm"
import Image from "next/image"
import female from "@/public/female.png"
import male from "@/public/male.png"
import SignupId from "./SignupId"
import SignupPwd from "./SignupPwd"
import SignupName from "./SignupName"
import SignupGender from "./SignupGender"
export default function StudentSignupTemplate({ id, code }) {
    const [step,setStep] = useState(0);
    const [userId,setUserId] = useState('');
    const [userName,setUserName] = useState('');
    const [userGender,setUserGender] = useState('');
    const [gender, setGender] = useState('');
    // const onChange = (e) => {
    //     const { changeHandler, value, blurHandler } = getFieldProps(e.target.name);
    //     changeHandler(e);

    // }
    // const onGenderChange = (e) => {
    //     onChange(e);
    //     setGender(e.target.value)

    // }
    // const validate = (values) => {
    //     const errors = { id: "", pwd: "", pwdCheck: "", name: "", teacher: "", nickname: "", admin: false, gender: "", hasBlank: "" }

    //     if (!values.id) errors.id = "아이디를 입력하세요"
    //     if (!values.pwd) errors.pwd = "비밀번호를 입력하세요"
    //     if (!values.pwdCheck) errors.pwdCheck = "비밀번호를 입력해주세요"
    //     if (values.pwd !== values.pwdCheck) errors.pwdCheck = "비밀번호가 일치하지 않습니다"
    //     if (!values.name) errors.name = "이름을 입력하세요"
    //     if (!values.nickname) errors.nickname = "별명을 입력하세요"
    //     if (!values.gender) errors.gender = "성별을 선택해주세요"
    //     if (values.id.includes(" ")) errors.hasBlank = "아이디에 공백이 있습니다"


    //     return errors
    // }

    // const { form, errors, isTouched, submitHandler, getFieldProps } = useValidateForm({
    //     initialForm: { id: "", pwd: "", pwdCheck: "", name: "", admin: false, nickname: "", teacher: id, gender: "" },
    //     initialError: { id: "", pwd: "", pwdCheck: "", name: "", admin: false, nickname: "", teacher: "", gender: "", hasBlank: "" },
    //     initialIsTouched: { id: false, pwd: false, pwdCheck: false, name: false, gender: false },
    //     validate,
    //     type: 'register'
    // });

    return (
        <form>
            <div className=" text-[2rem] mt-[16px] font-bold w-[400px] max-[400px]:w-[100%] m-auto">학생 회원가입🍊</div>
            {step == 0 
            ? <SignupId   setStep={setStep} setUserId={setUserId}/>
            : step == 1
            ? <SignupName setUserName={setUserName} setStep={setStep}/>
            : step == 2
            ? <SignupGender setUserGender={setUserGender} userGender={userGender} setStep={setStep}/>
            : <SignupPwd   setStep={setStep} teacher={id} userId={userId} userName={userName} userGender={userGender}/>}
            {/* <div className="w-full flex flex-col items-center mt-[40px]">
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
                                <input type="checkbox" id="male" name="gender" className="hidden" onChange={onGenderChange} value="male" />
                            </div>
                            <div className={`border-4 ${gender === "female" ? " border-orange-500" : null}`}>
                                <label for="female">
                                    <div className="border-4 w-[120px] h-[160px] relative cursor-pointer">
                                        <Image src={female} alt="character" fill={true} priority={true} />
                                    </div>
                                    <div className="text-center">여학생</div>
                                </label>
                                <input type="checkbox" id="female" name="gender" className="hidden" onChange={onGenderChange} value="female" />
                            </div>
                        </div>
                    </div>
                    <div className="text-red-500 text-center mb-[16px]">{errors.name || errors.id || errors.hasBlank || errors.nickname || errors.pwd || errors.pwdCheck || errors.gender}</div>
                    <AuthBtn className="text-blue-100 mb-[0px]">회원가입</AuthBtn>


                </div>
            </div> */}
        </form>
    )
}