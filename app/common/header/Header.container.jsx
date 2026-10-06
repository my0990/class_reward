"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useFetchData, STUDENT_REFRESH } from "@/hooks/useFetchData";
import { teacherNav, studentNav } from "@/config/navConfig";
import HomeBtn from "./components/HomeBtn";
import ClassSwitcher from "./components/ClassSwitcher";
import HeaderNav from "./components/HeaderNav";
import UserInfo from "./components/userInfo";
import DropDown from "./components/dropdown";
import UserIcon from "./components/UserIcon";
import { useNoticeBadge } from "@/hooks/useNoticeBadge";
export default function HeaderContainer({ classId }) {
    const pathname = usePathname();
    // kiosk route면 헤더 숨김 (기존 로직 유지)

    const {
        data: classData,
        isLoading: isClassLoading,
        isError: isClassError,
      } = useFetchData( `/api/classData/${classId}`);
    
      const {
        data: userData,
        isLoading: isUserLoading,
        isError: isUserError,
      } = useFetchData(`/api/user`, STUDENT_REFRESH);

    // 새 공지 표시 (교사만)
    const { hasNew: hasNewNotice } = useNoticeBadge(userData?.role === "teacher");
    const badges = { notices: hasNewNotice };

    // 메뉴 상태


    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
    const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
    const profileIconRef = useRef(null);

    const toggleHamburger = () => setIsHamburgerOpen((v) => !v);
    const toggleUserInfo = () => setIsUserInfoOpen((v) => !v);

    // 라우트 이동 시 닫기
    useEffect(() => setIsHamburgerOpen(false), [pathname]);
    useEffect(() => setIsUserInfoOpen(false), [pathname]);

    // tools hover 핸들러 (timeoutId를 지역변수로 두면 렌더 때마다 초기화되는 문제 있어서 ref로)


    const isLoading =
        isClassLoading ||
        isUserLoading

    const isError =
        isClassError ||
        isUserError 



    if (isLoading) {
        return <div></div>;
    }

    if (isError) {
        return <div>데이터 로드 실패</div>;
    }


    const { className = "", currencyEmoji, currencyName } = classData;
    const { profileUrl = "", role, userId, money } = userData;
    const navItems = userData.role === "teacher" ? teacherNav : studentNav
    const homeHref = `/${role}/dashboard/${classId}`
    const settingHref = `/${role}/dashboard/${classId}/setting`

    return (
        <>
            <div className="border-b-2">
                <div className="page-width py-[16px] items-center flex text-[1.2rem] justify-between text-gray-500 font-semibold">


                    {/* 교사: 학급 이름(대시보드) + ▾ 다른 학급 선택 / 학생: 학급 이름만 */}
                    {role === "teacher"
                        ? <ClassSwitcher classId={classId} className={className} homeHref={homeHref} />
                        : <HomeBtn {...{ homeHref, className }} />}

                    {/* Desktop Nav */}
                    <HeaderNav navItems={navItems} pathname={pathname} classId={classId} badges={badges} />


                    {/* Right Icons */}
                    <UserIcon {...{ toggleUserInfo, profileIconRef, profileUrl, toggleHamburger, }} hasBadge={hasNewNotice} />
                </div>
            </div>

            {isHamburgerOpen ? (
                <DropDown badges={badges} role={role} userId={userId} money={money} navItems={navItems} currencyEmoji={currencyEmoji} settingHref={settingHref}
                    currencyName={currencyName} />
            ) : null}

            {isUserInfoOpen ? (
                <UserInfo
                    profileiconRef={profileIconRef}
                    open={isUserInfoOpen}
                    onClose={setIsUserInfoOpen}
                    classData={classData}
                    settingHref={settingHref}
                    userId={userId}
                    money={money}
                    currencyEmoji={currencyEmoji}
                    currencyName={currencyName}
                    role={role}
                />
            ) : null}
        </>
    );
}