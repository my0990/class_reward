import AuthInput from "./components/authInput"
import AuthBtn from "./components/authBtn"
export default function SignUpPage(){
    return(
        <div className="w-full h-screen flex flex-col items-center justify-center">
            <div className="w-10/12 min-[500px]:w-[400px] mx-5 ">
                <div className="text-[3rem] mb-5">
                    회원가입
                </div>
                <AuthInput placeholder="이름을 입력해주세요"/>
                <AuthInput placeholder="아이디를 입력해주세요"/>
                <AuthInput placeholder="비밀번호를 입력해주세요"/>
                <AuthInput placeholder="비밀번호를 한번 더 입력해주세요"/>
                <AuthBtn className="text-blue-100 mb-[0px]">회원가입</AuthBtn>
                <div className="flex flex-col w-full border-opacity-50">
                    <div className="divider">OR</div>
                </div>
                <AuthBtn className="text-blue-100">로그인</AuthBtn>
            </div>
        </div>
    )
}