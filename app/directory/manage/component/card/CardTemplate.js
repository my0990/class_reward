import Image from "next/image"
import male from "@/public/male.png"
export default function CardTemplate({picked}) {
    console.log(picked)
    return (
        <div className="w-[352px] h-[500px] bg-orange-200 p-[16px] rounded-xl">
            <div >
                <div className="flex items-center relative">
                    <div className="w-[50px] h-[50px] rounded-full bg-white border-4 border-orange-400 z-50 flex justify-center items-center font-bold">lv {picked?.lv}</div>
                    <div className=" h-[40px] bg-white absolute left-[30px] border-4 border-orange-400 rounded-xl px-[20px] font-bold flex items-center">각성에 다다른 자</div>
                </div>
            </div>
            <div className="flex justify-center flex-col items-center my-[16px]">
                <div className="w-[200px] h-[200px] rounded-full bg-white flex justify-center items-center">
                    <Image src={male}/>
                    {/* <img src="https://i.postimg.cc/HLXdVT11/orange.png"></img> */}
                </div>
                <div className=" py-[12px] w-full text-center text-[1.2rem] h-[52.8px] bg-green-400 text-white font-bold rounded-xl">{picked?.profileNickname}</div>
            </div>
            <div className="w-full h-[134px] bg-white rounded-xl p-[8px]">{picked?.profileState}</div>
        </div>
    )
}