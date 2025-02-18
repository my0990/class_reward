// import { connectDB } from "@/app/lib/database";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"
// import { getServerSession } from "next-auth"
'use client'
import { fetchData } from "@/hooks/swrHooks";
export default async function Page() {



    const { data: userData, isLoading: isUserLoading, isError: isUserError } = fetchData('/api/fetchUserData');
    // const { user } = await getServerSession(authOptions)
    // const { userId } = user
    // const db = (await connectDB).db('data')
    // const response = await db.collection('user_data').findOne({ userId: userId })
    // if (response === null) {
    //     return
    // }
    if (isUserLoading) return <div>Loading data...</div>;
    if (isUserError) return <div>Error loading data</div>;
    return (
        <div className="flex justify-center py-[100px]">
            <div className="max-w-[352px] flex p-[8px] bg-green-400 justify-center rounded-xl">
            <div className="w-[352px] h-[500px] bg-orange-200 p-[16px] rounded-xl">
                <div >
                    <div className="flex items-center relative">
                        <div className="w-[50px] h-[50px] rounded-full bg-white border-4 border-orange-400 z-50 flex justify-center items-center font-bold">lv {userData?.lv}</div>
                        <div className=" h-[40px] bg-white absolute left-[30px] border-4 border-orange-400 rounded-xl pl-[24px] pr-[16px] font-bold flex items-center">{userData?.profileNickname}</div>
                    </div>
                </div>
                <div className="flex justify-center flex-col items-center my-[16px]">
                    <div className="w-[165px] h-[165px] mb-[16px] rounded-full bg-green-400 flex justify-center items-center overflow-hidden">
                        <img src={userData.profileUrl} width="150" height="150" alt="orange" className="rounded-full"/>
                    </div>
                    <div className=" py-[12px] w-full text-center text-[1.2rem] h-[52.8px] bg-green-400 text-white font-bold rounded-xl">초보 오렌지</div>
                </div>
                <div className="w-full h-[134px] bg-white rounded-xl p-[8px]">{userData?.profileState}</div>
            </div>
        </div>
        </div>

    )
}