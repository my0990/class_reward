import { signOut } from "next-auth/react"
import Link from "next/link"
import gold from "@/public/gold.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
export default function DropDown({ session, money }) {
    const pathname = usePathname();
    return (
        <div className="border-b-2 min-[601px]:hidden dark:text-white">
            <ul>
                <li className="mt-[1rem]">
                    <div className="flex items-center justify-space ">
                        <div className="py-[0.5rem] px-[8px] text-[1.2rem] ml-[8px]">
                            {session.userName}님, 환영합니다
                        </div>

                        <button className="rounded-[20px]  py-[4px] px-[8px] text-gray-700 border-gray-300 flex  bg-orange-200 border-0" onClick={() => signOut()}>로그아웃
                            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" className="ml-[4px] text-gray-500">
                                <path d="M17 16L21 12M21 12L17 8M21 12L7 12M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                        </button>
                    </div>
                </li>
                <li className="py-[0.5rem] px-[16px]  text-[1.2rem]">
                    <div className="flex">
                        <div className="mr-3"><Image src={gold} width={24} height={24} alt="gold" /></div>
                        {/* <div>{response.money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원</div> */}
                        {session.role === "teacher" ? <div>- 원 </div> : <div>{money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원</div>}
                    </div>
                </li>
                <Link href="/directory/setting"><li className="py-[0.5rem] px-[16px] pb-[1rem] text-[1.2rem] border-b-2 flex">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 50 50">
                        <path d="M47.16,21.221l-5.91-0.966c-0.346-1.186-0.819-2.326-1.411-3.405l3.45-4.917c0.279-0.397,0.231-0.938-0.112-1.282 l-3.889-3.887c-0.347-0.346-0.893-0.391-1.291-0.104l-4.843,3.481c-1.089-0.602-2.239-1.08-3.432-1.427l-1.031-5.886 C28.607,2.35,28.192,2,27.706,2h-5.5c-0.49,0-0.908,0.355-0.987,0.839l-0.956,5.854c-1.2,0.345-2.352,0.818-3.437,1.412l-4.83-3.45 c-0.399-0.285-0.942-0.239-1.289,0.106L6.82,10.648c-0.343,0.343-0.391,0.883-0.112,1.28l3.399,4.863 c-0.605,1.095-1.087,2.254-1.438,3.46l-5.831,0.971c-0.482,0.08-0.836,0.498-0.836,0.986v5.5c0,0.485,0.348,0.9,0.825,0.985 l5.831,1.034c0.349,1.203,0.831,2.362,1.438,3.46l-3.441,4.813c-0.284,0.397-0.239,0.942,0.106,1.289l3.888,3.891 c0.343,0.343,0.884,0.391,1.281,0.112l4.87-3.411c1.093,0.601,2.248,1.078,3.445,1.424l0.976,5.861C21.3,47.647,21.717,48,22.206,48 h5.5c0.485,0,0.9-0.348,0.984-0.825l1.045-5.89c1.199-0.353,2.348-0.833,3.43-1.435l4.905,3.441 c0.398,0.281,0.938,0.232,1.282-0.111l3.888-3.891c0.346-0.347,0.391-0.894,0.104-1.292l-3.498-4.857 c0.593-1.08,1.064-2.222,1.407-3.408l5.918-1.039c0.479-0.084,0.827-0.5,0.827-0.985v-5.5C47.999,21.718,47.644,21.3,47.16,21.221z M25,32c-3.866,0-7-3.134-7-7c0-3.866,3.134-7,7-7s7,3.134,7,7C32,28.866,28.866,32,25,32z"></path>
                    </svg>
                    <div className="ml-[8px]">설정</div>
                </li></Link>
                {session.role === 'teacher' ?
                    <>
                        <Link href="/directory/manage"><li className={`py-[0.5rem] px-[16px] mt-[1rem] text-[1.2rem] ${pathname === "/directory/manage" ? "text-orange-400" : null}`}>학생 관리</li></Link>
                        <Link href="/directory/market"><li className={`py-[0.5rem] px-[16px]  text-[1.2rem] ${pathname === "/directory/market" ? "text-orange-400" : null}`}>아이템 관리</li></Link>
                        {/* <Link href="./"><li className="py-[0.5rem] px-[16px]  text-[1.2rem]">기록 보기</li></Link> */}
                        <Link href="/directory/quest"><li className={`py-[0.5rem] px-[16px]  text-[1.2rem] ${pathname === "/directory/quest" ? "text-orange-400" : null}`}>퀘스트 관리</li></Link>
                        <Link href="/directory/qrcode"><li className={`py-[0.5rem] px-[16px] mb-[1rem] text-[1.2rem] ${pathname === "/directory/qrcode" ? "text-orange-400" : null}`}>학생 초대</li></Link>

                    </> :
                    <>
                        {/* <Link href="./"><li className="py-[0.5rem] px-[8px] ml-[8px] text-[1.2rem]">기록보기</li></Link> */}
                        <Link href="/directory/browse"><li className={`py-[1.5rem] px-[8px] ml-[8px] text-[1.2rem] ${pathname === "/directory/browse" ? "text-orange-400" : null}`}>둘러보기</li></Link>
                    </>
                }

            </ul>
        </div>
    )
}