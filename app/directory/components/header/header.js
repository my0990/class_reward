'use client'
import Link from "next/link";
import { useState } from "react";
import DropDown from "./dropdown";
import UserInfo from "./userInfo";
import { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { fetchData } from "@/hooks/swrHooks";
export default function Header({ session }) {
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    const { data: userData, isLoading: isUserLoading, isError: isUserError } = fetchData('/api/fetchUserData');


    const [isClient, setIsClient] = useState(false)
    const { role } = session
    const [openMenu, setOpenMenu] = useState(null);
    const [isHamburgerClicked, setIsHamburgerClicked] = useState(false);
    const profileiconRef = useRef();
    const pathname = usePathname();

    const hamburgerClicked = () => {
        setIsHamburgerClicked(props => !props)
    }
    const [isUserinfoClicked, setIsUserinfoClicked] = useState(false);

    const userinfoClicked = () => {
        setIsUserinfoClicked(props => !props)
    }



    useEffect(() => { isHamburgerClicked ? setIsHamburgerClicked(false) : null }, [pathname])
    useEffect(() => { isUserinfoClicked ? setIsUserinfoClicked(false) : null }, [pathname])


    useEffect(() => {
        setIsClient(true)
    }, [])
    if (pathname === "/directory/kiosk") {
        return (
            null
        )
    }



    let timeoutId = null;
  
    const handleMouseEnter = (menu) => {
      if (timeoutId) clearTimeout(timeoutId); // 닫히는 것을 방지
      setOpenMenu(menu);
    };
  
    const handleMouseLeave = () => {
      timeoutId = setTimeout(() => {
        setOpenMenu(null);
      }, 300); // 300ms 후에 서브메뉴 닫기
    };

    if (isClassLoading || isUserLoading) return <div></div>;
    if (isClassError || isUserError) return <div>Error loading data</div>;
    return (

        <>
            <div className="border-b-2 " >
                <div className="p-[24px]  max-[980px]:p-[16px] flex  text-[1.2rem] justify-between text-gray-500 font-semibold">
                    <div className="flex items-center">
                        <div className="min-[601px]:mr-[5vw]">
                            <Link prefetch={false} href="/directory/dashboard" replace>
                                <div className="w-[56px] h-[56px] font-medium rounded-full border-4  bg-orange-500 text-[32px] transition-all hover:scale-110 bg-orange-500 text-white transition-all duration-500 align-middle flex justify-center items-center">
                                    뀰
                                </div>
                            </Link>
                        </div>
                        <div>
                            {session.role === 'teacher' ?
                                <ul className="flex max-[980px]:hidden">
                                    <Link prefetch={false} href="/directory/manage" key="manage"><li className={`mr-[3vw] dark:text-white ${pathname === "/directory/manage" ? "border-b-8 border-orange-400" : null}`}>학생 관리</li></Link>
                                    <Link prefetch={false} href="/directory/market" key="market"><li className={`mr-[3vw] dark:text-white ${pathname === "/directory/market" ? "border-b-8 border-orange-400" : null}`}>아이템 관리</li></Link>
                                    <Link prefetch={false} href="/directory/thermometer" key="thermometer"><li className={`mr-[3vw] dark:text-white ${pathname === "/directory/thermometer" ? "border-b-8 border-orange-400" : null}`}>학급 온도계</li></Link>
                                    <Link prefetch={false} href="/directory/quest" key="quest"><li className={`mr-[3vw] dark:text-white ${/^\/directory\/quest/.test(pathname) || /^\/directory\/questDetail/.test(pathname) ? "border-b-8 border-orange-400" : null}`}>퀘스트 관리</li></Link>
                                    <Link prefetch={false} href="/directory/profile" key="profile"><li className={`mr-[3vw] dark:text-white ${pathname === "/directory/profile" ? "border-b-8 border-orange-400" : null}`}>프로필 관리</li></Link>
                                    <Link prefetch={false} href="/kiosk"><li className={` dark:text-white mr-[3vw]`}>키오스크 모드</li></Link>
                                    {/* <nav className="bg-gray-800 text-white p-4"> */}
                                    <ul className=""
>
                                        {/* 메뉴 1 */}
                                        <li
                                            className="relative group"
                                            onMouseEnter={() => handleMouseEnter("menu1")}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <button
                                                className="block "
                                                onClick={() => toggleMenu("menu1")}
                                            >
                                                편의 기능
                                            </button>
                                            <ul
                                                className={`absolute left-0 mt-2 w-40 bg-orange-300 rounded-lg overflow-hidden shadow-lg transition-opacity duration-200 
              ${openMenu === "menu1" ? "opacity-100 visible" : "opacity-0 invisible"}
            `}
                                            >
                                                <li className="">
                                                    <a href="https://my0990.github.io/random_number/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-500 block px-4 py-2 ">
                                                        대포 번호 뽑기
                                                    </a>
                                                </li>
                                                <li className="">
                                                    <a href="https://my0990.github.io/decibel_meter/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-500 block px-4 py-2 ">
                                                        타이머
                                                    </a>
                                                </li>
                                                <li className="">
                                                    <a href="https://my0990.github.io/switching_seats/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-500 block px-4 py-2 ">
                                                        자리 바꾸기
                                                    </a>
                                                </li>
                                                <li className="">
                                                    <a href="http://localhost:3000/tools/random" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-500 block px-4 py-2 ">
                                                        테스트
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                    {/* </nav> */}


                                </ul> :
                                <ul className="flex max-[980px]:hidden">
                                    <Link prefetch={false} href="/directory/inventory"><li className={`mr-[3vw] dark:text-white ${pathname === "/directory/inventory" ? "border-b-8 border-orange-400" : null}`}>창고 가기</li></Link>
                                    <Link prefetch={false} href="/directory/market"><li className={`mr-[3vw] dark:text-white ${pathname === "/directory/market" ? "border-b-8 border-orange-400" : null}`}>상점 가기</li></Link>
                                    <Link prefetch={false} href="/directory/thermometer"><li className={`mr-[3vw] dark:text-white ${pathname === "/directory/thermometer" ? "border-b-8 border-orange-400" : null}`}>학급온도계</li></Link>
                                    <Link prefetch={false} href="/directory/profile" key="profile"><li className={`mr-[3vw] dark:text-white ${pathname === "/directory/profile" ? "border-b-8 border-orange-400" : null}`}>프로필 상점</li></Link>
                                    <Link prefetch={false} href="/directory/quest" key="quest"><li className={`mr-[3vw] dark:text-white ${/^\/directory\/quest/.test(pathname) || /^\/directory\/questDetail/.test(pathname) ? "border-b-8 border-orange-400" : null}`}>퀘스트</li></Link>



                                </ul>
                            }

                        </div>
                    </div>
                    {/* 아이콘 */}
                    <div className="flex">
                        {/* {isClient && session.role === "teacher" && data && data?.notification?.length > 0 
                        ?<div className="mr-[8px] min-[980px]:mr-[16px]">
                                <Link prefetch={false} href="/directory/notification"><Notification /></Link>
                            </div>
                            : null
                        } */}
                        <div className="avatar cursor-pointer max-[980px]:hidden flex items-center justify-center" onClick={userinfoClicked} ref={profileiconRef}>
                            <div className="w-12 h-12 rounded-full ring ring-gray ring-offset-base-100 ring-offset-2 ">
                                <img src={userData.profileUrl} width="90" height="90" alt="characther" />
                            </div>
                        </div>

                        {/* 메뉴창 */}
                        <div className="flex items-center min-[981px]:hidden">
                            <div tabIndex={0} role="button" className="btn btn-ghost align-middle p-0 ">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={hamburgerClicked}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isHamburgerClicked ? <DropDown role={role} userData={userData} classData={classData} /> : null}
            {isUserinfoClicked ? <UserInfo session={session} profileiconRef={profileiconRef} isUserinfoClicked={isUserinfoClicked} setIsUserinfoClicked={setIsUserinfoClicked} userData={userData} classData={classData} /> : null}
        </>

    )
}