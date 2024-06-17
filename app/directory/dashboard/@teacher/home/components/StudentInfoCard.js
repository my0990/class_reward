'use client'

import Image from "next/image"
import male from "@/public/male.png"
import female from "@/public/female.png"
export default function StudentInfoCard(props) {
    return (
        <div {...props} className="w-[120px] h-[160px] bg-orange-300 rounded-[5%] flex flex-col justify-center items-center cursor-pointer m-[1px]">
            <div className="w-[90px] h-[90px] bg-white rounded-full mb-3 overflow-hidden">
                <Image src={props.data.gender === "male" ? male : female} alt="character" width={120} height={160} priority={true} />
            </div>
            <div className="text-[1.5rem]">{props.children}</div>
        </div>
    )
}