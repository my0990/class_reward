'use client'

import Logout from "./logout"
import Link from "next/link";
import Notification from "./notification";
import character from "@/public/character.jpeg"
import male from "@/public/male.png"
import female from "@/public/female.png"
import Image from "next/image";
import { useState } from "react";
import DropDown from "./dropdown";
import UserInfo from "./userInfo";
import { useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import path from "path";

export default function Header({ session, notificationCount, money, gender }) {
    const router = useRouter();
    const [isHamburgerClicked, setIsHamburgerClicked] = useState(false);
    const hamburgerClicked = () => {
        setIsHamburgerClicked(props => !props)
    }
    const [isUserinfoClicked, setIsUserinfoClicked] = useState(false);

    const userinfoClicked = () => {
        setIsUserinfoClicked(props => !props)
    }
    console.log('gender: ', gender)
    const profileiconRef = useRef();
    const pathname = usePathname();

    useEffect(() => { isHamburgerClicked ? setIsHamburgerClicked(false) : null }, [pathname])
    useEffect(() => { isUserinfoClicked ? setIsUserinfoClicked(false) : null }, [pathname])

    return (

        <>
            <div className="border-b-2" >
                <div className="p-[24px] max-[700px]:p-[16px] flex  text-[1.2rem] justify-between text-gray-500 font-semibold">
                    <div className="flex items-center">
                        <div className="min-[601px]:mr-[5vw]">
                            <Link href="/directory/dashboard" replace><div className="w-[48px] h-[48px] rounded-lg text-orange-500 text-[40px] bg-orange-500 hover:bg-white transition-all duration-500 align-middle flex justify-center items-center font-bold">뀰</div></Link>

                        </div>
                        <div>
                            {session.role === 'teacher' ?
                                <ul className="flex max-[700px]:hidden">
                                    <Link href="/directory/manage" key="manage"><li className={`mr-[3vw] dark:text-white ${pathname === "/directory/manage" ? "border-b-8 border-orange-400" : null}`}>학생 관리</li></Link>
                                    <Link href="/directory/market" key="market"><li className={`mr-[3vw] dark:text-white ${pathname === "/directory/market" ? "border-b-8 border-orange-400" : null}`}>아이템 관리</li></Link>
                                    <Link href="/directory/quest" key="quest"><li className={`mr-[3vw] dark:text-white ${/^\/directory\/quest/.test(pathname) || /^\/directory\/questDetail/.test(pathname) ? "border-b-8 border-orange-400" : null}`}>퀘스트 관리</li></Link>
                                    <Link href="/directory/qrcode"><li className={` dark:text-white ${pathname === "/directory/qrcode" ? "border-b-8 border-orange-400" : null}`}>학생 초대</li></Link>


                                </ul> :
                                <ul className="flex max-[700px]:hidden">
                                    <Link href="/directory/quest" key="quest"><li className={`mr-[3vw] dark:text-white ${/^\/directory\/quest/.test(pathname) || /^\/directory\/questDetail/.test(pathname) ? "border-b-8 border-orange-400" : null}`}>퀘스트</li></Link>
                                    <Link href="/directory/browse"><li className={`dark:text-white ${pathname === "/directory/browse" ? "border-b-8 border-orange-400" : null}`}>둘러보기</li></Link>

                                </ul>
                            }

                        </div>
                    </div>
                    {/* 아이콘 */}
                    <div className="flex">
                        {session.role === "teacher" && notificationCount > 0 &&
                            <div className="mr-[8px] min-[700px]:mr-[16px]">
                                <Link href="/directory/notification"><Notification /></Link>
                            </div>

                        }
                        <div className="avatar cursor-pointer max-[700px]:hidden flex items-center justify-center" onClick={userinfoClicked} ref={profileiconRef}>

                            <div className="w-12 h-12 rounded-full ring ring-gray ring-offset-base-100 ring-offset-2 ">
                                <Image src={gender === "male" ? male : gender === "female" ? female : character} alt="character" />
                            </div>

                        </div>

                        {/* 메뉴창 */}
                        <div className="flex items-center min-[701px]:hidden">
                            <div tabIndex={0} role="button" className="btn btn-ghost align-middle p-0 ">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={hamburgerClicked}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isHamburgerClicked ? <DropDown session={session} money={money} /> : null}
            {isUserinfoClicked ? <UserInfo session={session} money={money} profileiconRef={profileiconRef} isUserinfoClicked={isUserinfoClicked} setIsUserinfoClicked={setIsUserinfoClicked} /> : null}
            {/* <UserInfo ref={dropDownRef}/> */}

        </>
    )
}