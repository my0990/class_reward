import Image from "next/image"
import gold from "@/public/gold.png"
import character from "@/public/character.jpeg"
export default function BrowseCard() {
    return (
        <div className="w-[700px] max-[600px]:w-[100%] bg-gray-100 box-content rounded-2xl mb-[16px] mx-[16px]">
            <div className="flex p-[24px]">
                <div className="avatar mr-[24px]">
                    <div className="w-12 rounded-full ring ring-gray ring-offset-base-100 ring-offset-2">
                        <Image src={character} alt="character" />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center w-[150px]">
                    <div className="flex  w-[100%]">
                        <div>이명권</div>
                        <div className="text-gray-400">(한줄기 빛)</div>
                    </div>
                    <div className="flex w-[100%]">
                        <div className="w-[24px] h-[24px] mr-[8px]"><Image src={gold} alt="gold"/></div>
                        <div>100,000원</div>
                    </div>
                </div>
            </div>
            <div className="px-[24px] pb-[8px] text-[1.2rem] font-bold">보유아이템</div>
            <div className="flex px-[24px] pb-[24px] flex-wrap">
                <div className="mr-[4px]">아이템1</div>
                <div className="mr-[4px]">아이템2</div>
                <div className="mr-[4px]">아이템3</div>
                <div className="mr-[4px]">아이템4</div>
                <div className="mr-[4px]">아이템1</div>
                <div className="mr-[4px]">아이템2</div>
                <div className="mr-[4px]">아이템3</div>
                <div className="mr-[4px]">아이템4</div>
                <div className="mr-[4px]">아이템1</div>
                <div className="mr-[4px]">아이템2</div>
                <div className="mr-[4px]">아이템3</div>
                <div className="mr-[4px]">아이템4</div>

            </div>
        </div>
    )
}