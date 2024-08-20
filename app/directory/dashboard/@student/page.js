import Image from "next/image";
import gold from "@/public/gold.png";
import character from "@/public/character.jpeg"
import male from "@/public/male.png"
import female from "@/public/female.png"
import Link from "next/link";
import { connectDB } from "@/app/lib/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"

export default async function Page() {
    const { user } = await getServerSession(authOptions)
    const { userId } = user
    const db = (await connectDB).db('data')
    const response = await db.collection('user_data').findOne({ userId: userId })
    if (response === null) {
        return
    }
    return (
        <div className="flex justify-center py-[100px]">
            <div className="max-w-[352px] flex p-[8px] bg-green-400 justify-center rounded-xl">
            <div className="w-[352px] h-[500px] bg-orange-200 p-[16px] rounded-xl">
                <div >
                    <div className="flex items-center relative">
                        <div className="w-[50px] h-[50px] rounded-full bg-white border-4 border-orange-400 z-50 flex justify-center items-center font-bold">lv {response?.lv}</div>
                        <div className=" h-[40px] bg-white absolute left-[30px] border-4 border-orange-400 rounded-xl pl-[24px] pr-[16px] font-bold flex items-center">{response?.profileNickname}</div>
                    </div>
                </div>
                <div className="flex justify-center flex-col items-center my-[16px]">
                    <div className="w-[200px] h-[200px] rounded-full bg-white flex justify-center items-center">
                        {/* <Image src={male}/> */}
                        <img src="https://i.postimg.cc/HLXdVT11/orange.png" width="100" height="100" alt="orange" />
                        {/* <img src="https://i.postimg.cc/HLXdVT11/orange.png"></img> */}
                    </div>
                    <div className=" py-[12px] w-full text-center text-[1.2rem] h-[52.8px] bg-green-400 text-white font-bold rounded-xl">초보 오렌지</div>
                </div>
                <div className="w-full h-[134px] bg-white rounded-xl p-[8px]">{response?.profileState}</div>
            </div>
            {/* <div className="w-[320px] border-4 rounded-lg p-[24px]">

                <h1 className="text-center dark:text-white">LV {response.lv}</h1>
                <h2 className="text-center dark:text-white">{response.userName}<span className="text-gray-400">({response.profileNickname})</span></h2>

                <div className="w-[120px] h-[160px] bg-gray-300 mx-auto  rounded-lg rounded-[48px] relative">
                    <Image src={response.userGender === "male" ? male : female} alt="character" fill={true} priority={true} />

                </div>
                <div className="flex justify-center my-[8px]">
                    <div className="bg-[#2b3440] h-[48px] rounded-lg text-white flex justify-center items-center w-[100%] m-[0px]">&ldquo;{response.profileState ? response.profileState : "...."}&rdquo;</div>
                </div> */}

            {/* <div>
                    <Link href="./inventory"><button className="btn w-full bg-blue-700 text-white dark:hover:bg-orange-300 border-0">보유 아이템 보러가기</button></Link>
                </div>
                <div>
                    <Link href="./market"><button className="btn w-full mt-[8px] bg-orange-500 text-white dark:hover:bg-orange-300 border-0">아이템 사러 가기</button></Link>
                </div> */}
        </div>
        </div>

    )
}