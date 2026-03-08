'use client'

export default function StudentInfoCard(props) {
    // console.log(props)
    const { exptable, currencyemoji } = props
    console.log(props)
    const { startExp, commonDifference } = exptable;
    const findLargestSumUnderTarget = () => {

        let k = Math.floor((-2 * startExp + commonDifference + Math.sqrt((2 * startExp - commonDifference) ** 2 + 8 * commonDifference * props.data.exp)) / (2 * commonDifference));
        let sumK = (k / 2) * (2 * startExp + (k - 1) * commonDifference);

        if (sumK > props.data.exp) {
            return k
        } else {
            return k + 1
        }

    };
    return (
        // <div {...props} className={`w-[120px] m-[8px] ${props.isactive ? "bg-orange-500" : ""} h-[160px] bg-orange-300 rounded-[5%] flex flex-col justify-center items-center cursor-pointer`}>
        //     <div className="w-[90px] h-[90px] bg-white rounded-full mb-3 border-[6px] border-white overflow-hidden flex justify-center items-center">
        //         <img src={props.data.profileUrl} width="90" height="90" alt="orange" className=""/>
        //     </div>
        //     <div className="text-[1rem] font-bold">{props.children}</div>
        // </div>
        <div>
            <div {...props} className={`w-[160px] p-[16px] m-[8px] bg-orange-200 rounded-xl cursor-pointer ${props.isactive ? "bg-orange-500" : ""}`}>
                <div className="flex justify-between mb-[8px]">
                    <div className="font-semibold">LV. {findLargestSumUnderTarget()}</div>
                    <div className="w-[80px] text-right overflow-hidden whitespace-nowrap">{currencyemoji} {props.data.money} </div>
                </div>
                <div className="flex overflow-hidden border-4 border-white justify-center items-center w-[110px] h-[110px] mb-[8px] mx-auto bg-white rounded-full">
                    <img src={props.data.profileUrl} width="100" height="100" alt="characther" className="rounded-full" />
                </div>
                <h1 className="text-[1rem] font-bold text-center overflow-hidden">{props.data.classNumber}. {props.data.profileNickname}</h1>
                <div className="bg-white rounded-lg flex items-center justify-center">
                    {props.data.profileTitle}
                </div>
            </div>
        </div>
    )
}