'use client'
import RewardBox from "./RewardBox"
import Scale from "./Scale"
export default function ThermometerObject({ reward, currentDegree }) {
    let tmp = []
    let start = 95;
    for (let index = 0; index < 11; index++) {

        tmp.push(start)
        start += 31
    }




    return (
        <div className="flex w-[120px] justify-center relative items-center flex-col   ">

            <div className="w-[88px] translate-y-[18px] h-[340px] z-20 overflow-hidden bg-white  border-t-8 border-x-8  border-red-500  rounded-t-full  flex justify-center">

            </div>
            <div className="absolute w-[48px] bg-red-500 z-30  bottom-[120px] rounded-t-full  " style={{ height: 30 + (3.1 * currentDegree) + 'px' }}></div>
            {/* <div className="w-[160px] h-[160px] bg-white flex z-10  justify-center items-center border-8 border-red-500  rounded-full ">
                <div className="w-[112px] h-[112px] bg-red-500   rounded-full  " />
            </div> */}
            <div className="w-[160px] h-[160px] bg-white flex z-10 justify-center items-center border-8 border-red-500 rounded-full">

                <div className="w-[112px] h-[112px] bg-red-500 rounded-full relative">

                    {/* 볼 */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[24px] h-[24px] bg-pink-100 rounded-full opacity-80" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[24px] h-[24px] bg-pink-100 rounded-full opacity-80" />

                    {/* 눈 */}
                    <div className="absolute left-[28px] top-[32px] w-[12px] h-[12px] bg-black rounded-full">
                        <div className="absolute top-[2px] left-[3px] w-[4px] h-[4px] bg-white rounded-full" />
                    </div>

                    <div className="absolute right-[28px] top-[32px] w-[12px] h-[12px] bg-black rounded-full">
                        <div className="absolute top-[2px] left-[3px] w-[4px] h-[4px] bg-white rounded-full" />
                    </div>

                    {/* 코 */}
                    <div className="absolute left-1/2 top-[50px] -translate-x-1/2 w-[6px] h-[6px] bg-yellow-300 rounded-full" />

                    {/* 입 */}
                    <div className="absolute left-1/2 top-[60px] -translate-x-1/2 w-[24px] h-[12px] border-b-[3px] border-black rounded-b-full" />

                </div>

            </div>
            <div className="absolute bottom-[48px] left-[126px]">
                {tmp.map((a, i) => {
                    return (
                        <Scale degree={a} key={i} />
                    )
                })}
            </div>
            {Object.entries(reward || {}).map(([key, text]) => {
                if (!text) return null; // ⭐ 빈 값이면 렌더링 안함
                const degree = Number(key);
                const side = degree % 20 === 10 ? 'left' : 'right';

                return (
                    <RewardBox key={degree} degree={degree} side={side}>
                        {text}
                    </RewardBox>
                );
            })}
            {/* 
            {tmp.map((a, i) => 
                
                    reward[i * 10] !== undefined
                    ? <Reward degree={a}  key={i}>{tmpReward[i * 10]}</Reward>
                    : null
            )} */}
            {/* {reward[100]!=='' ? <Reward degree={425}>{reward[100]}</Reward> : null } */}
        </div>


    )
}