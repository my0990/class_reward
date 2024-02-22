import AuthInput from "./components/authInput"
import AuthBtn from "./components/authBtn"
export default function AuthPage(){
    return(
        <div className="w-full h-screen flex flex-col items-center justify-center">
            <div className="w-10/12 min-[500px]:w-[400px] mx-5 ">
                <div className="w-[80vw] h-[80vw]  min-[400px]:w-[300px] min-[400px]:h-[300px] bg-orange-500 mb-10 mx-auto rounded-full flex items-center justify-center">
                    <div className="text-[15vw] min-[400px]:text-[56px] text-white origin-bottom -rotate-12 italic">something</div>
                </div>
                <AuthInput placeholder="아이디를 입력해주세요"/>
                <AuthInput placeholder="비밀번호를 입력해주세요"/>
                <AuthBtn className="text-blue-100 mb-[0px]">로그인</AuthBtn>
                <div className="flex flex-col w-full border-opacity-50">
                    <div className="divider">OR</div>
                </div>
                <AuthBtn className="text-blue-100">회원가입</AuthBtn>
            </div>
        </div>
    )
}