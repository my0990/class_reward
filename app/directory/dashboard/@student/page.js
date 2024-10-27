// import { connectDB } from "@/app/lib/database";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"
// import { getServerSession } from "next-auth"
'use client'
import { userDataState } from '@/store/atoms';
import { useRecoilState } from "recoil";
export default async function Page() {



    const [data, setClassData] = useRecoilState(userDataState);
    // const { user } = await getServerSession(authOptions)
    // const { userId } = user
    // const db = (await connectDB).db('data')
    // const response = await db.collection('user_data').findOne({ userId: userId })
    // if (response === null) {
    //     return
    // }
    return (
        <div className="flex justify-center py-[100px]">
            <div className="max-w-[352px] flex p-[8px] bg-green-400 justify-center rounded-xl">
            <div className="w-[352px] h-[500px] bg-orange-200 p-[16px] rounded-xl">
                <div >
                    <div className="flex items-center relative">
                        <div className="w-[50px] h-[50px] rounded-full bg-white border-4 border-orange-400 z-50 flex justify-center items-center font-bold">lv {data?.lv}</div>
                        <div className=" h-[40px] bg-white absolute left-[30px] border-4 border-orange-400 rounded-xl pl-[24px] pr-[16px] font-bold flex items-center">{data?.profileNickname}</div>
                    </div>
                </div>
                <div className="flex justify-center flex-col items-center my-[16px]">
                    <div className="w-[200px] h-[200px] rounded-full bg-white flex justify-center items-center">
                        <img src={data.profileUrl} width="100" height="100" alt="orange" />
                    </div>
                    <div className=" py-[12px] w-full text-center text-[1.2rem] h-[52.8px] bg-green-400 text-white font-bold rounded-xl">초보 오렌지</div>
                </div>
                <div className="w-full h-[134px] bg-white rounded-xl p-[8px]">{data?.profileState}</div>
            </div>
        </div>
        </div>

    )
}