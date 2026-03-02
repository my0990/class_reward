"use client";

import Link from "next/link";
import DropDown from "./widget/dropdown";
import UserInfo from "./widget/userInfo";
import HeaderNav from "./widget/HeaderNav";

export default function HeaderView({

    role,
    pathname,
    classData,
    navItems,
    homeHref,
    settingHref,
    balanceText,
    profileUrl,
    userId,
    money,
    currencyName,
    currencyEmoji,

    isHamburgerOpen,
    setIsHamburgerOpen,
    isUserInfoOpen,
    setIsUserInfoOpen,


    profileIconRef,

    toggleHamburger,
    toggleUserInfo,
    classId
}) {



    return (
        <>
            <div className="border-b-2">
                <div className="px-[48px] py-[16px] max-[980px]:p-[16px] items-center flex text-[1.2rem] justify-between text-gray-500 font-semibold">


                    <div className="">
                        <Link prefetch={false} href={homeHref} replace>
                            <div
                                className="
                                            w-[110px] h-[56px]
                                            font-medium text-[24px] font-extrabold text-orange-500
                                            hover:scale-110 transition-all duration-500
                                            align-middle flex justify-start items-center
                                            overflow-hidden whitespace-nowrap text-ellipsis

                                        "
                            >
                                {classData.className}
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <HeaderNav navItems={navItems} pathname={pathname} classId={classId} />


                    {/* Right Icons */}
                    <div className="flex">
                        {/* Profile (desktop only) */}
                        <div
                            className="avatar cursor-pointer max-[980px]:hidden flex items-center justify-center"
                            onClick={toggleUserInfo}
                            ref={profileIconRef}
                        >
                            <div className="w-12 h-12 rounded-full ring ring-gray ring-offset-base-100 ring-offset-2">
                                <img src={profileUrl} width="90" height="90" alt="characther" />
                            </div>
                        </div>

                        {/* Hamburger (mobile only) */}
                        <div className="flex items-center min-[981px]:hidden">
                            <div tabIndex={0} role="button" className="btn btn-ghost align-middle p-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    onClick={toggleHamburger}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h8m-8 6h16"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isHamburgerOpen ? (
                <DropDown role={role} userId={userId} money={money} navItems={navItems} />
            ) : null}

            {isUserInfoOpen ? (
                <UserInfo
                    profileiconRef={profileIconRef}
                    open={isUserInfoOpen}
                    onClose={setIsUserInfoOpen}
                    classData={classData}
                    settingHref={settingHref}
                    balanceText={balanceText}
                    userId={userId}
                    money={money}
                    currencyEmoji={currencyEmoji}
                    currencyName={currencyName}

                />
            ) : null}
        </>
    );
}