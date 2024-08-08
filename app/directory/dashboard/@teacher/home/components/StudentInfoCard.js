'use client'

import Image from "next/image"
import male from "@/public/male.png"
import female from "@/public/female.png"
export default function StudentInfoCard(props) {
    return (
        <div {...props} className={`w-[120px] ${props.isActive ? "bg-orange-500" : null} h-[160px] bg-orange-300 rounded-[5%] flex flex-col justify-center items-center cursor-pointer m-[1px]`}>
            <div className="w-[90px] h-[90px] bg-white rounded-full mb-3 overflow-hidden flex justify-center items-center">
                {/* <Image src={props.data.userGender === "male" ? male : female} alt="character" width={120} height={160} priority={true} /> */}
                <img src="https://i.postimg.cc/HLXdVT11/orange.png" width="70" height="70" alt="orange"/>
            </div>
            <div className="text-[1rem] font-bold">{props.children}</div>
        </div>
    )
}