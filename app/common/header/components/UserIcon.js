export default function UserIcon({toggleUserInfo, profileIconRef, profileUrl, toggleHamburger,}) {
    return (
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
    )
}