import Link from "next/link";
import { profileImgProps } from "@/util/image/profileImage";
export default function UserIcon({toggleUserInfo, profileIconRef, profileUrl, toggleHamburger, hasBadge = false, pendingCount = 0, approvalsHref}) {
    return (
        <div className="flex items-center gap-3">
            {/* 승인 대기 알림: 누르면 승인 센터로 */}
            {pendingCount > 0 && approvalsHref && (
                <Link
                    href={approvalsHref}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-orange-50 hover:text-orange-500"
                    title={`승인 대기 ${pendingCount}건`}
                    aria-label={`승인 대기 ${pendingCount}건`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-4-5.7V5a2 2 0 1 0-4 0v.3A6 6 0 0 0 6 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white">
                        {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                </Link>
            )}

            {/* Profile (desktop only) */}
            <div
                className="avatar cursor-pointer max-[980px]:hidden flex items-center justify-center"
                onClick={toggleUserInfo}
                ref={profileIconRef}
            >
                <div className="w-12 h-12 rounded-full ring ring-gray ring-offset-base-100 ring-offset-2">
                    <img {...profileImgProps(profileUrl, 48)} width="90" height="90" alt="characther" />
                </div>
            </div>

            {/* Hamburger (mobile only) */}
            <div className="flex items-center min-[981px]:hidden">
                <div tabIndex={0} role="button" className="btn btn-ghost align-middle p-0 relative">
                    {/* 새 공지나 승인 대기가 있으면 빨간 점 */}
                    {hasBadge && (
                        <span className="absolute right-0 top-1 h-[10px] w-[10px] rounded-full bg-red-500 ring-2 ring-white" aria-label="새 알림" />
                    )}
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
    )
}