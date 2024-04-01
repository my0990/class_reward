'use client'
import AuthInput from "./components/authInput"
import AuthBtn from "./components/authBtn"
import { useValidateForm } from "@/app/lib/useValidateForm"
import { useRouter } from "next/navigation"

export default function AuthPage(){

    const onChange = (e) => {
        const {changeHandler, value, blurHandler} = getFieldProps(e.target.name);
        changeHandler(e);
    }
    const validate = (values) => {
        const errors = { id: "", pwd: "", pwdCheck: ""}
        
        if (!values.id) errors.id = "아이디를 입력하세요"
        if (!values.pwd) errors.pwd = "비밀번호를 입력하세요"
        
        return errors
      }

    const { form, errors, isTouched, submitHandler, getFieldProps } = useValidateForm({
    initialForm: { id: "", pwd: "",},
    initialError: { id: "", pwd: "", },
    initialIsTouched: { id: false, pwd: false,  },
    validate,
    type: 'logIn'
    });

    const route = useRouter();
    return(
        <form type="POST" onSubmit={submitHandler}>
        <div className="w-full h-screen flex flex-col items-center justify-center">
            <div className="w-10/12 min-[500px]:w-[400px] mx-5 ">
                <div className="w-[80vw] h-[80vw]  min-[400px]:w-[300px] min-[400px]:h-[300px] bg-orange-500 mb-10 mx-auto rounded-full flex items-center justify-center">
                    <div className="text-[15vw] min-[400px]:text-[56px] text-white origin-bottom -rotate-12 italic">something</div>
                </div>
                <AuthInput placeholder="아이디를 입력해주세요" name="id" onChange={onChange} />
                <AuthInput placeholder="비밀번호를 입력해주세요" name="pwd" type="password"  onChange={onChange}/>
                <div className="text-red-500 text-center mb-3">{errors[Object.keys(errors).find((element)=> errors[element] !== '')]}</div>
                <AuthBtn className="text-blue-100 mb-[0px]" type="submit">로그인</AuthBtn>
                <div className="flex flex-col w-full border-opacity-50">
                    <div className="divider">OR</div>
                </div>
                <AuthBtn className="text-blue-100" type="button" onClick={()=> route.push("./signup")}>회원가입</AuthBtn>
            </div>
        </div>
        </form>

    )
}
