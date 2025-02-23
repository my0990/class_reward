export default function CardTemplate({ picked, startExp, commonDifference }) {

    const findLargestSumUnderTarget = () => {
        if(picked){
            let k = Math.floor((-2 * startExp + commonDifference + Math.sqrt((2 * startExp - commonDifference) ** 2 + 8 * commonDifference * picked.exp)) / (2 * commonDifference));
            let sumK = (k / 2) * (2 * startExp + (k - 1) * commonDifference);

        if(sumK > picked.exp){
            return k
        } else {
            return k+1
        }
    }
    };

    return (
        <div className="w-[352px] h-[500px] bg-orange-200 p-[16px] rounded-xl">
            <div >
                <div className="flex items-center relative">
                    <div className="w-[50px] h-[50px] rounded-full bg-white border-4 border-orange-400 z-50 flex justify-center items-center font-bold">lv {picked && findLargestSumUnderTarget()}</div>
                    <div className=" h-[40px] bg-white absolute left-[30px] border-4 border-orange-400 rounded-xl pl-[24px] pr-[16px] font-bold flex items-center">{picked?.profileNickname}</div>
                </div>
            </div>
            <div className="flex justify-center flex-col items-center my-[16px]">
                <div className="w-[190px] h-[190px] rounded-full bg-white flex justify-center items-center mb-[12px]">
                    {/* <Image src={male}/> */}
                    <img src={picked?.profileUrl} width="170" height="170" alt="orange" className="rounded-full" />
                    {/* <img src="https://i.postimg.cc/HLXdVT11/orange.png"></img> */}
                </div>
                <div className=" py-[12px] w-full text-center text-[1.2rem] h-[52.8px] bg-green-400 text-white font-bold rounded-xl">초보 오렌지</div>
            </div>
            <div className="w-full h-[134px] bg-white rounded-xl p-[8px]">{picked?.profileState}</div>
        </div>
    )
}