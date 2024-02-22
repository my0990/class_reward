export default function Header() {
    return (
        <div className="navbar bg-base-100 ">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a>학생가입용 qr코드</a></li>
                        <li><a>보상주기</a></li>
                        <li><a>아이템 관리1</a></li>
                        <li><a>로그아웃</a></li>
                    </ul>
                </div>
                <a className="btn btn-ghost text-xl">someThing</a>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li><a>학생가입용 qr코드</a></li>
                    <li><a>보상주기</a></li>
                    <li><a>아이템 관리</a></li>
                </ul>
            </div>
            <div className="navbar-end">
                <a className="btn">로그아웃</a>
            </div>
        </div>
    )
}