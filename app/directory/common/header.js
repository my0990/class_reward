'use client'

import Logout from "./logout"
import Link from "next/link";
import Notification from "./notification";
import character from "@/public/character.jpeg"
import Image from "next/image";
import { useState } from "react";
import DropDown from "./dropdown";
import UserInfo from "./userInfo";
import { useRef } from "react";
import { useEffect } from "react";
export default function Header({ session, notificationCount }) {
    const [isHamburgerClicked, setIsHamburgerClicked] = useState(false);
    const hamburgerClicked = () => {
        setIsHamburgerClicked(props => !props)
    }
    const [isUserinfoClicked,setIsUserinfoClicked] = useState(false);
    const userinfoClicked = () => {
        setIsUserinfoClicked(props => !props)
    }
    const profileiconRef = useRef();

    return (
        // <div className="navbar bg-base-100 min-[1300px]:w-[1290px] min-[800px]:w-[780px]  mx-auto">
        //     <div className="navbar-start">
        //         <div className="dropdown">
        //             <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
        //                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
        //             </div>
        //             {role === "teacher" ?
        //                                 <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        //                                     <Link href="./qrcode"><li>학생가입용 qr코드</li></Link>
        //                                     <Link href="./"><li>전체 보상 주기</li></Link>
        //                                     <Link href="./market"><li>아이템 관리</li></Link>
        //                                     <Logout ismobile='false'/>
        //                                 </ul> :
        //                                 <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        //                                     <Logout ismobile='false'/>
        //                                 </ul> }

        //         </div>
        //         <Link href="./dashboard"><div className="text-xl  bg-red-400 p-[16px] text-white">someThing</div></Link>
        //     </div>
        //     <div className="navbar-center hidden lg:flex">
        //         {role === "teacher" ?
        //         <ul className="menu menu-horizontal px-1 text-lg">
        //             <Link href="./qrcode" className="btn-ghost p-[8px] rounded-lg mr-[16px] "><li>학생가입용 qr코드</li></Link>
        //             <Link href="./" className="btn-ghost p-[8px] rounded-lg mr-[16px] "><li>보상주기</li></Link>
        //             <Link href="./market" className="btn-ghost p-[8px] rounded-lg bg-white border-white"><li>아이템 관리</li></Link>
        //         </ul> :
        //             null
        //         }

        //     </div>
        //     <div className="navbar-end">
        //         {role === "teacher" && notificationCount > 0?
        //             <div>
        //                 <Link href="./notification"><Notification /></Link>
        //             </div>
        //             :
        //             null
        //     }
        //         <Logout ismobile='true'/>
        //     </div>
        // </div>
        <>
            <div className="border-b-2" >
                <div className="p-[24px]  flex  text-[1.2rem] justify-between text-gray-500 font-semibold">
                    <div className="flex items-center">
                        <div className="min-[601px]:mr-[5vw]">
                            <Link href="./dashboard"><div className="w-[48px] h-[48px] rounded-lg bg-orange-500 align-middle"></div></Link>
                        </div>
                        <div>
                            {session.role === 'teacher' ?
                                <ul className="flex max-[600px]:hidden">
                                    <Link href="./qrcode"><li className="mr-[5vw]">학생 관리</li></Link>
                                    <Link href="./market"><li className="mr-[5vw]">아이템 관리</li></Link>
                                    <Link href="./log"><li className="mr-[5vw]">기록 보기</li></Link>
                                    <Link href="./qrcode"><li>학생 초대</li></Link>
                                </ul> :
                                <ul className="flex max-[600px]:hidden">
                                    <Link href="./qrcode"><li className="mr-[5vw]">기록보기</li></Link>
                                    <Link href="./market"><li>염탐하기</li></Link>
                                </ul>
                            }

                        </div>
                    </div>
                    {/* 아이콘 */}
                    <div className="avatar cursor-pointer max-[600px]:hidden" onClick={userinfoClicked} ref={profileiconRef}>
                        <div className="w-12 rounded-full ring ring-gray ring-offset-base-100 ring-offset-2">
                            <Image src={character} alt="character"/>
                        </div>
                    </div>

                    {/* 메뉴창 */}
                    <div className="flex items-center min-[601px]:hidden">
                        <div tabIndex={0} role="button" className="btn btn-ghost align-middle p-0 ">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={hamburgerClicked}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                        </div>
                    </div>
                </div>
            </div>
            {isHamburgerClicked ? <DropDown session={session} /> : null}
            {isUserinfoClicked ? <UserInfo profileiconRef={profileiconRef} isUserinfoClicked={isUserinfoClicked} setIsUserinfoClicked={setIsUserinfoClicked}/> : null }
            {/* <UserInfo ref={dropDownRef}/> */}

        </>
    )
}