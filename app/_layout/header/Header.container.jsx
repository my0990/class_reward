"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchData } from "@/hooks/swrHooks";

import HeaderView from "./_component/Header.view";
import { teacherNav } from "@/config/navConfig";


export default function HeaderContainer({ classId }) {
    const pathname = usePathname();

    // kiosk route면 헤더 숨김 (기존 로직 유지)


    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError } = fetchData(`/api/classData/${classId}`);
    const { data: studentsData, isLoading: isStudentsDataLoading, isError: isStudentsDataError } = fetchData(`/api/students/${classId}`);
    const { data: userData, isLoading: isUserDataLoading, isError: isUserDataError } = fetchData(`/api/user`);




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
    const onToolsEnter = () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        setOpenToolsMenu(true);
    };
    const onToolsLeave = () => {
        closeTimerRef.current = setTimeout(() => setOpenToolsMenu(false), 250);
    };


    const homeHref = `/teacher/dashboard/${classId}`
    const settingHref = "/setting"
    const isLoading =
        isClassDataLoading ||
        isStudentsDataLoading ||
        isUserDataLoading;

    const isError =
        isClassDataError ||
        isStudentsDataError ||
        isUserDataError;

    if (isLoading) {
        return <div>불러오는 중...</div>;
    }

    if (isError) {
        return <div>데이터 로드 실패</div>;
    }



    return (
        <HeaderView
            pathname={pathname}
            classData={classData}
            userData={userData}
            isLoading={isLoading}
            isError={isError}
            navItems={teacherNav}
            homeHref={homeHref}
            settingHref={settingHref}
            profileUrl={userData?.profileUrl ?? ""}
            userId= {userData?.userId ?? ""}
            money = {Number(userData?.money ?? 0).toLocaleString("ko-KR")}
            currencyName = {classData?.currencyName ?? "원"}
            currencyEmoji = {classData?.currencyEmoji ?? "💰"}
            // state
            isHamburgerOpen={isHamburgerOpen}
            setIsHamburgerOpen={setIsHamburgerOpen}
            isUserInfoOpen={isUserInfoOpen}
            setIsUserInfoOpen={setIsUserInfoOpen}
            openToolsMenu={openToolsMenu}

            // refs
            profileIconRef={profileIconRef}
            // handlers

            onToolsEnter={onToolsEnter}
            onToolsLeave={onToolsLeave}
            toggleHamburger={toggleHamburger}
            toggleUserInfo={toggleUserInfo}


            classId={classId}
        />
    );
}