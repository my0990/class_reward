'use client'
import { useState, useRef } from "react"
export default function CreateUniqueNickname() {
    const [error, setError] = useState(false);
    const [isLoading,setIsLoading] = useState(false);
    const ref = useRef();
    const onClick = (e) => {

        if (isLoading) {
            return
        } else {
            setIsLoading(true);
            if (ref.current.value === '') {

                setError("아무것도 입력되어 있지 않습니다")
                setIsLoading(false);
                return
            } else if(/\d/.test(ref.current.value)){
                setError("숫자는 입력할 수 없습니다")
                setIsLoading(false);
                return
            }
            fetch("/api/checkUniqueNickname", {
                method: "POST",
                body: JSON.stringify({ uniqueNickname: ref.current.value }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    alert('고유 별명을 등록하였습니다.')
                } else {
                    setError(ref.current.value + '은(는) 이미 존재하는 별명입니다.')
                    setIsLoading(false);
                }
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
                        1. 고유 닉네임은 임의의 숫자를 추가하여 학생들의 계정 아이디가 됩니다. <br></br>
                        ex&#41; 꿈틀, 새싹, power...
                    </li>
                    <li className="mt-[8px]">
                        2. 한번 생성한 후에는 수정할 수 없습니다.
                    </li>
                    <li className="mt-[8px]">
                        3. 숫자는 입력할 수 없습니다.
                    </li>
                </ol>
                <div className="flex justifty-center flex-col items-center mt-[32px]">
                    <div className="flex flex-col">
                        <input ref={ref} placeholder="고유 별명을 입력하세요" className="mb-[8px] outline-orange-400 p-[8px] rounded-lg border-gray-300 border-2"/>
                        <div className="text-red-500 text-[1rem] text-center">{error}</div>
                        <button onClick={onClick} className="bg-orange-300 p-[8px] mt-[8px] rounded-lg hover:bg-orange-500">확인</button>
                    </div>
                </div>
            </fieldset>
        </div>
    )
}