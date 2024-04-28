import styles from './userinfo.module.css'
import { signOut } from "next-auth/react"
import Image from "next/image"
import gold from "@/public/gold.png";
import { useRef, useEffect } from 'react';
export default function UserInfo({session, isUserinfoClicked, setIsUserinfoClicked, profileiconRef, money}) {
    const dropDownRef = useRef();
    useEffect(()=> {

        const outSideClick = (e) => {
           const { target } = e;

           if (
             isUserinfoClicked &&
             dropDownRef.current &&
             !dropDownRef.current.contains(target) &&
             !profileiconRef.current.contains(target)
            
           ) {
             setIsUserinfoClicked(false);
           }
         };
         document.addEventListener("mousedown", outSideClick);
         return () => document.removeEventListener('mousedown', outSideClick);
       }, [isUserinfoClicked]);
    return (
        <div className="max-[600px]:hidden" ref={dropDownRef}>
            <div className={styles.speechBubble}>
                <div className="flex items-center justify-space text-[1rem]">
                    <div className="py-[1rem] px-[8px]  ml-[8px]">
                        {session.userName}님, 환영합니다
                    </div>
                    <button className="rounded-[20px] border-2 py-[4px] px-[8px] text-gray-500 border-gray-300 flex" onClick={() => signOut()}>로그아웃
                        <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" className="ml-[4px] text-gray-500">
                            <path d="M17 16L21 12M21 12L17 8M21 12L7 12M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                    </button>
                </div>
                <ul>
                    <li className="pb-[1rem] px-[16px]   border-b-2">
                        <div className="flex">
                            <div className="mr-3"><Image src={gold} width={24} height={24} alt="gold" /></div>
                            {/* <div>{response.money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원</div> */}
                            {session.role === "teacher" ? <div>- 원 </div> : <div>{money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원 </div>}

                        </div>
                    </li>
                    <li className="py-[1rem] px-[8px]  ml-[8px]">프로필 수정하기</li>
                    {/* <li className="py-[1rem] px-[8px]  ml-[8px]"></li>
                    <li className="py-[1rem] px-[8px]  ml-[8px]">menu 2</li> */}
                </ul>
            </div>
        </div>
    )
}