'use client'
import { useState, useRef } from "react"
import { mutate } from "swr";
import { checkUniqueNickname } from "@/server-action/actions/account/account.action";
export default function CreateUniqueNickname({classId}) {
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isClick,setIsClick] = useState(false);
    const ref = useRef();
    const onClick = (e) => {

        if (isLoading) {
            return
        } else {
            setIsLoading(true);
            // ✅ 앞뒤 공백 제거: 한번 생성하면 수정이 불가능한 필드라서,
            // 공백이 그대로 들어가면 학생 로그인 아이디에 영구히 공백이 박힘
            const value = ref.current.value.trim();

            if (value === '') {

                setError("아무것도 입력되어 있지 않습니다")
                setIsLoading(false);
                return
            } else if (/\d/.test(value)) {
                setError("숫자는 입력할 수 없습니다")
                setIsLoading(false);
                return
            }
            checkUniqueNickname({ uniqueNickname: value, classId: classId }).then((data) => {

                if (data.result === true) {
                    alert('고유 별명을 등록하였습니다.')
                    mutate(`/api/classData/${classId}`)
                } else {
                    setError(data.error || (value + '은(는) 이미 존재하는 별명입니다.'))
                    setIsLoading(false);
                }
            }).catch(() => {
                // ✅ 네트워크 오류나 서버 액션 호출 자체가 실패했을 때
                // isLoading이 계속 true로 남아 "확인" 버튼이 영원히 막히는 문제를 방지
                setError("요청 중 오류가 발생했습니다. 다시 시도해주세요.")
                setIsLoading(false);
            })
        }

    }
    return (
        <div className="text-[1.4rem]">
            <fieldset className="border-2 border-black p-[16px] rounded-xl">
                <legend>
                    고유 닉네임 입력
                </legend>
                <ol>
                    <li>
                        1. 고유 닉네임은 학급 번호를 추가하여 학생들의 계정 아이디가 됩니다. <br></br>
                        계정 아이디 -&#62; 고유아이디 + 학급번호<br></br>
                        ex&#41; <span className="text-orange-500">꿈틀</span>이 고유닉네임이라면 학생들 아이디는 꿈틀1, 꿈틀2, 꿈틀3... 가 됩니다.
                    </li>
                    <li className="mt-[8px] flex flex-wrap">
                        <div>고유 닉네임이 <span className="text-orange-500">쿠키</span>, 학생의 학급 번호가 <span className="text-green-500">3</span>번이라면 학생 아이디는 뭐가 될까요?</div>
                        {isClick ? <div className="ml-[8px] text-orange-500">쿠키<span className="text-green-500">3</span></div> : <div onClick={()=>setIsClick(true)} className="cursor-pointer ml-[8px] w-[50px] bg-gray-500"></div>}
                    </li>
                    <li className="mt-[8px]">
                        2. 학생들은 계정 아이디와 비밀번호를 입력하여 로그인합니다. 초기 비밀번호는 12345678입니다.
                    </li>

                    <li className="mt-[8px] bg-red-400">
                        3. 한번 생성한 후에는 수정할 수 없습니다!!!!
                    </li>
                    <li className="mt-[8px]">
                        4. 숫자는 입력할 수 없습니다.
                    </li>

                </ol>
                <div className="flex justifty-center flex-col items-center mt-[32px]">
                    <div className="flex flex-col">
                        <input ref={ref} placeholder="고유 별명을 입력하세요" className="mb-[8px] outline-orange-400 p-[8px] rounded-lg border-gray-300 border-2" />
                        <div className="text-red-500 text-[1rem] text-center">{error}</div>
                        <button onClick={onClick} className="bg-orange-300 p-[8px] mt-[8px] rounded-lg hover:bg-orange-500">확인</button>
                    </div>
                </div>
            </fieldset>
        </div>
    )
}