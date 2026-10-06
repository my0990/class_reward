import { calculateLevel } from "@/util/level/level.utils";

export default function CardTemplate({ picked, startExp, commonDifference }) {

    const level = picked
        ? calculateLevel({ exp: picked.exp, startExp, commonDifference })
        : null;

    return (
        <div className="w-[352px] max-w-full h-[500px] bg-orange-200 p-[16px] rounded-xl max-[480px]:h-auto">
            <div >
                <div className="flex items-center relative">
                    <div className="w-[50px] h-[50px] rounded-full bg-white border-4 border-orange-400 z-50 flex justify-center items-center font-bold">lv {level}</div>
                    <div className=" h-[40px] bg-white absolute left-[30px] border-4 border-orange-400 rounded-xl pl-[24px] pr-[16px] font-bold flex items-center">{picked?.profileNickname}</div>
                </div>
            </div>
            <div className="flex justify-center flex-col items-center my-[16px]">
                <div className="w-[190px] h-[190px] max-[480px]:w-[150px] max-[480px]:h-[150px] border-[6px] border-white overflow-hidden rounded-full bg-white flex justify-center items-center mb-[12px]">
                    <img src={picked?.profileUrl} width="170" height="170" alt="orange" className="rounded-full" />
                </div>
                <div className=" py-[12px] w-full text-center text-[1.2rem] h-[52.8px] bg-green-400 text-white font-bold rounded-xl">{picked?.profileTitle}</div>
            </div>
            <div className="w-full h-[134px] max-[480px]:h-auto max-[480px]:min-h-[60px] bg-white rounded-xl p-[8px] break-words">{picked?.profileState}</div>
        </div>
    )
}
