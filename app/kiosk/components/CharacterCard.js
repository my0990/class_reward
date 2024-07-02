import male from "@/public/male.png"
import female from "@/public/female.png"
import gold from "@/public/gold.png"
import Image from "next/image"
export default function CharacterCard(props) {
    return (
        <div>
        <div {...props} className="w-[160px] h-[192px] p-[16px] m-[8px] bg-[#cc93ac] rounded-xl cursor-pointer ">
            <h1 className="text-[1.2rem] font-bold text-center">{props.user.userName}</h1>
            <div className="relative w-[128px] h-[100px] ">
                <Image src={props.user.userGender === "male" ? male : female} fill={true} al="characther" />
            </div>
            <div className="mt-[8px] flex items-center justify-center">
                <div className="relative w-[24px] h-[24px] mr-[8px]">
                    <Image src={gold} alt="gold" fill={true}></Image>
                </div>
                <div>{props.user.money}</div>
            </div>
        </div>
        </div>
    )
}