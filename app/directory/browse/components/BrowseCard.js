import Image from "next/image"
import gold from "@/public/gold.png"
import character from "@/public/character.jpeg"
export default function BrowseCard({data}) {
    return (
        <div className="w-[640px] dark:text-black max-[640px]:w-[100%] max-[640px]:mx-[16px] max-[640px]:my-[8px] bg-orange-200 box-content rounded-2xl my-[16px] mx-[16px]">
            <div className="flex p-[24px]">
                <div className="avatar mr-[24px]">
                    <div className="w-12 rounded-full ring ring-gray ring-offset-base-100 ring-offset-2">
                        <Image src={character} alt="character" />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center w-[150px]">
                    <div className="flex  w-[100%]">
                        <div className="dark:text-black">{data.userName}</div>
                        <div className="opacity-50 dark:text-gray-600">({data.profileNickname})</div>
                    </div>
                    <div className="flex w-[100%] ">
                        <div className="w-[24px] h-[24px] mr-[8px]"><Image src={gold} alt="gold"/></div>
                        <div>{data.money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원</div>
                    </div>
                </div>
            </div>
            <div className="mx-[24px] flex">"{data.profileState}"</div>
            <div className="px-[24px] pt-[12px] pb-[8px] text-[1.2rem] font-bold">보유아이템</div>
            <div className="flex px-[24px] pb-[24px] flex-wrap">
                {data.itemList.map((a,i)=>{
                    console.log(a.state)
                    return(
                        a.state === "사용 가능" ? <div className="mr-[8px]">{a.itemName}</div> : <div className="mr-[8px] text-gray-400">{a.itemName}</div> 
                    )
                })}
            

            </div>
        </div>
    )
}