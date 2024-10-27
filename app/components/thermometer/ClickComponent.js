'use client'
import character from '@/public/hanla.png';
import Image from "next/image";
export default function ClickComponent(){
    return(
        <div className="text-[2rem]">
        <div className="flex justify-center">
            <Image src={character} />
        </div>
        <div>
            <span>학급 온도계</span>를 시작하시려면 <span onClick={()=>document.getElementById('my_modal_3').showModal()} className="border-b-4 border-orange-500 hover:rounded-lg cursor-pointer hover:scale-110 inline-block transition-all hover:border-0 hover:px-[8px] hover:text-orange-500">
                 여기
            </span>를 눌러주세요
        </div>
    </div>
    )
}