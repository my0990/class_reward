import { signOut } from "next-auth/react"
import Link from "next/link"

export default function DropDown({ session }) {
    let tmp = ['학생 관리', '초대하기', '아이템 관리', '기록 보기']
    console.log(session)
    return (
        <div className="border-b-2 min-[601px]:hidden">
            <ul>
                <li>
                    <div className="flex items-center justify-space ">
                        <div className="py-[1rem] px-[8px] text-[1.2rem] ml-[8px]">
                            강지현님, 환영합니다
                        </div>

                        <button className="rounded-[20px] border-2 py-[4px] px-[8px] text-gray-500 border-gray-300 flex" onClick={() => signOut()}>로그아웃
                            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" className="ml-[4px] text-gray-500">
                                <path d="M17 16L21 12M21 12L17 8M21 12L7 12M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                        </button>
                    </div>
                </li>
                {session.role === 'teacher' ?
                    <>
                        <Link href="./"><li className="pb-[1rem] px-[8px] ml-[8px] text-[1.2rem]">학생 관리</li></Link>
                        <Link href="./"><li className="pb-[1rem] px-[8px] ml-[8px] text-[1.2rem]">아이템 관리</li></Link>
                        <Link href="./"><li className="pb-[1rem] px-[8px] ml-[8px] text-[1.2rem]">기록 보기</li></Link>
                        <Link href="./"><li className="pb-[1rem] px-[8px] ml-[8px] text-[1.2rem]">구성원 초대</li></Link>
                    </> :
                    <>
                        <Link href="./"><li className="pb-[1rem] px-[8px] ml-[8px] text-[1.2rem]">기록보기</li></Link>
                        <Link href="./"><li className="pb-[1rem] px-[8px] ml-[8px] text-[1.2rem]">염탐하기</li></Link>
                    </>
                }

            </ul>
        </div>
    )
}