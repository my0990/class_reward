"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import useMultiFetch from "@/hooks/useMultiFetch";
import { teacherNav, studentNav } from "@/config/navConfig";
import HomeBtn from "./section/HomeBtn";
import HeaderNav from "./widget/HeaderNav";
import UserInfo from "./widget/userInfo";
import DropDown from "./widget/dropdown";
import UserIcon from "./section/UserIcon";
export default function HeaderContainer({ classId }) {
    const pathname = usePathname();

    // kiosk route면 헤더 숨김 (기존 로직 유지)


    const { data, isLoading, isError, results } = useMultiFetch([
        { key: "classData", url: `/api/classData/${classId}` },
        { key: "userData", url: `/api/user` },
    ]);

    const { classData, userData } = data

    // 메뉴 상태
    const [openToolsMenu, setOpenToolsMenu] = useState(false);
    const closeTimerRef = useRef(null);

    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
    const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
    const profileIconRef = useRef(null);

    const toggleHamburger = () => setIsHamburgerOpen((v) => !v);
    const toggleUserInfo = () => setIsUserInfoOpen((v) => !v);

    // 라우트 이동 시 닫기
    useEffect(() => setIsHamburgerOpen(false), [pathname]);
    useEffect(() => setIsUserInfoOpen(false), [pathname]);

    // tools hover 핸들러 (timeoutId를 지역변수로 두면 렌더 때마다 초기화되는 문제 있어서 ref로)




    if (isLoading) {
        return <div></div>;
    }

    if (isError) {
        return <div>데이터 로드 실패</div>;
    }


    const { className = "", currencyEmoji, currencyName } = classData;
    const { profileUrl = "", role, userId, money } = userData;
    const navItems = userData.role === "teacher" ? teacherNav : studentNav
    const homeHref = `/teacher/dashboard/${classId}`
    const settingHref = `/${role}/dashboard/${classId}/setting`

    return (
        <>
            <div className="border-b-2">
                <div className="px-[48px] py-[16px] max-[980px]:p-[16px] items-center flex text-[1.2rem] justify-between text-gray-500 font-semibold">


                    <HomeBtn {...{ homeHref, className }} />

                    {/* Desktop Nav */}
                    <HeaderNav navItems={navItems} pathname={pathname} classId={classId} />


                    {/* Right Icons */}
                    <UserIcon {...{ toggleUserInfo, profileIconRef, profileUrl, toggleHamburger, }} />
                </div>
            </div>

            {isHamburgerOpen ? (
                <DropDown role={role} userId={userId} money={money} navItems={navItems} currencyEmoji={currencyEmoji}
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