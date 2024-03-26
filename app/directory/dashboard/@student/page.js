import Image from "next/image";
import gold from "@/public/gold.png";
import character from "@/public/character.jpeg"
import Link from "next/link";
export default function Page(){
    return(
        <div className="flex justify-center bg-orange-300 py-[100px]">
            <div className="w-[320px] bg-pink-100 rounded-lg p-[24px]">
                <h1 className="text-center">LV ??</h1>
                <h2 className="text-center">강지현</h2>
                <div className="w-[120px] h-[160px] bg-gray-300 mx-auto mb-[32px] rounded-lg rounded-[48px] ">
                    <Image src={character} width={120} height={160}/>
                </div>
                <div className="flex justify-center mb-5">
                    <div className="mr-3"><Image src={gold} width={24} height={24} alt="gold"/></div>
                    <div>10,200,440원</div>
                </div>
                <div>
                    <Link href="./inventory"><button className="btn w-full bg-blue-700 text-white">보유 아이템 보러가기</button></Link>
                </div>
                <div>
                    <Link href="./market"><button className="btn w-full mt-[8px] bg-orange-500 text-white">아이템 사러 가기</button></Link>
                </div>
            </div>
        </div>
    )
}