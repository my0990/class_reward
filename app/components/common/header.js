import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import Logout from "./logout"
import Link from "next/link";
import Notification from "./notification";
import { connectDB } from "@/app/lib/database";
export default async function  Header() {
    const session = await getServerSession(authOptions);
    const role = session.user.role
    const db = (await connectDB).db('data');
    let notificationCount = 0
    if(session.user.role === "teacher"){
        const response = await db.collection('teacher').findOne({user:session.user.id})
        notificationCount = response.notificationCount;
    }

    return (
        <div className="navbar bg-base-100 min-[1300px]:w-[1290px] min-[800px]:w-[780px]  mx-auto">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    </div>
                    {role === "teacher" ?
                                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                            <Link href="./qrcode"><li>학생가입용 qr코드</li></Link>
                                            <Link href="./"><li>전체 보상 주기</li></Link>
                                            <Link href="./market"><li>아이템 관리</li></Link>
                                            <Logout ismobile='false'/>
                                        </ul> :
                                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                            <Logout ismobile='false'/>
                                        </ul> }

                </div>
                <Link href="./dashboard"><div className="btn btn-ghost text-xl px-0">someThing</div></Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                {role === "teacher" ?
                <ul className="menu menu-horizontal px-1">
                    <Link href="./qrcode" className="btn-ghost p-[8px] rounded-lg mr-[16px] "><li>학생가입용 qr코드</li></Link>
                    <Link href="./" className="btn-ghost p-[8px] rounded-lg mr-[16px] "><li>보상주기</li></Link>
                    <Link href="./market" className="btn-ghost p-[8px] rounded-lg bg-white border-white"><li>아이템 관리</li></Link>
                </ul> :
                    null
                }

            </div>
            <div className="navbar-end">
                {role === "teacher" && notificationCount > 0?
                    <div>
                        <Link href="./notification"><Notification /></Link>
                    </div>
                    :
                    null
            }
                <Logout ismobile='true'/>
            </div>
        </div>
    )
}