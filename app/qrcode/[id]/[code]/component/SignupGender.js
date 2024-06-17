import AuthInput from "@/app/components/auth/components/authInput"
import AuthBtn from "@/app/components/auth/components/authBtn"
import { useState, useRef } from "react"
import Image from "next/image";
import male from "@/public/male.png"
import female from "@/public/female.png"
export default function SignupGender({ setStep, setUserGender, userGender }) {
    const [error, setError] = useState({ id: '', hasBlank: '', idExist: '' });
    const onGenderChange = (e) => {
        setUserGender(e.target.value)

    }
    const onClick = (e) => {
        e.preventDefault();
        if (!userGender) setError(prev => ({ name: "성별을 선택하세요" }))
        else {
            setStep(prev => prev + 1)

        }

    }
    const genderRef = useRef();
    return (
        <div>
            <div className="flex mt-[32px] flex-col items-center text-red-900">
                <div className="w-[400px] max-[400px]:w-[100%] h-[700px] bg-orange-200 rounded-3xl p-[24px]">
                    <div className="flex">
                        <span className="rounded-full hover:scale-105 cursor-pointer " onClick={() => setStep(prev => prev - 1)}><svg height="32" viewBox="0 0 512 512" width="32" xmlns="http://www.w3.org/2000/svg"><title /><polyline points="244 400 100 256 244 112" style={{ fill: "none", stroke: "gray", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "48px" }} /><line style={{ fill: "none", stroke: "gray", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "48px" }} x1="120" x2="412" y1="256" y2="256" /></svg></span>
                        <div className="text-[1.5rem] font-bold ml-[8px]">성별 선택</div>
                    </div>
                    {/* <div><span className="underline">아이디</span>는 인터넷에서 나를 나타내는 특별한 이름이에요. 마치 학교에서 친구들이 나를 이름으로 부르는 것처럼, 인터넷에서는 아이디로 나를 불러요.</div> */}

                    <div className="mt-[16px]">
                        <div className="mb-[8px]">성별을 선택해주세요</div>
                        <div className="flex justify-evenly">
                        <div className={`border-4 ${userGender === "female" ? " border-orange-500" : "border-orange-200"}`}>
                                <label for="female">
                                    <div className="border-0 w-[120px] h-[160px] relative cursor-pointer">
                                        <Image src={female} alt="character" fill={true} priority={true} />
                                    </div>
                                    <div className="text-center">여학생</div>
                                </label>
                                <input type="checkbox" id="female" name="gender" className="hidden" onChange={onGenderChange} value="female" />
                            </div>
                            <div className={`border-4 ${userGender === "male" ? " border-orange-500" : "border-orange-200"}`}>
                                <label for="male" >
                                    <div className="border-0 w-[120px] h-[160px] relative cursor-pointer">
                                        <Image src={male} alt="character" fill={true} priority={true} />
                                    </div>
                                    <div className="text-center">남학생</div>
                                </label>
                                <input type="checkbox" id="male" name="gender" className="hidden" onChange={onGenderChange} value="male" />
                            </div>
                            
                        </div>
                        {Object.values(error).some(obj => Boolean(obj)) ? <div className=" text-red-500 h-[24px] flex items-center justify-center">{error.name}</div> : null}
                    </div>
                    <AuthBtn className="text-blue-100 mb-[0px] mt-[8px]" onClick={onClick}>다음</AuthBtn>
                </div>

            </div>
        </div>
    )

}