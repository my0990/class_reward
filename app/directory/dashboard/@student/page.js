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
    const response = await db.collection('student').findOne({ userId: userId })
    if (response === null) {
        return
    }
    return (
        <div className="flex justify-center py-[100px]">
            <div className="w-[320px] border-4 rounded-lg p-[24px]">

                <h1 className="text-center dark:text-white">LV {response.lv}</h1>
                <h2 className="text-center dark:text-white">{response.userName}<span className="text-gray-400">({response.profileNickname})</span></h2>

                <div className="w-[120px] h-[160px] bg-gray-300 mx-auto  rounded-lg rounded-[48px] relative">
                    <Image src={response.gender === "male" ? male : female} alt="character" fill={true} priority={true} />

                </div>
                <div className="flex justify-center my-[8px] ">"{response.profileState}"</div>
                {/* <div className="flex justify-center mb-5">
                    <div className="mr-3"><Image src={gold} width={24} height={24} alt="gold"/></div>
                    <div>{response.money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원</div>
                </div> */}
                <div>
                    <Link href="./inventory"><button className="btn w-full bg-blue-700 text-white dark:hover:bg-orange-300 border-0">보유 아이템 보러가기</button></Link>
                </div>
                <div>
                    <Link href="./market"><button className="btn w-full mt-[8px] bg-orange-500 text-white dark:hover:bg-orange-300 border-0">아이템 사러 가기</button></Link>
                </div>
            </div>
        </div>
    )
}