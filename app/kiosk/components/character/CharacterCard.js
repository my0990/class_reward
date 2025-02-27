
export default function CharacterCard(props) {
    const { user, startExp, commonDifference } = props
    const findLargestSumUnderTarget = () => {

        let k = Math.floor((-2 * startExp + commonDifference + Math.sqrt((2 * startExp - commonDifference) ** 2 + 8 * commonDifference * user.exp)) / (2 * commonDifference));
        let sumK = (k / 2) * (2 * startExp + (k - 1) * commonDifference);

        if (sumK > user.exp) {
            return k
        } else {
            return k + 1
        }

    };
    return (
        <div>
            <div {...props} className="w-[160px] p-[16px] m-[8px] bg-orange-200 rounded-xl cursor-pointer ">
                <div className="font-semibold">LV. {findLargestSumUnderTarget()}</div>
                <div className="flex justify-center items-center w-[110px] h-[110px] mb-[8px] mx-auto bg-white rounded-full">
                    <img src={user.profileUrl} width="100" height="100" alt="characther" className="rounded-full" />
                </div>
                <h1 className="text-[1rem] font-bold text-center overflow-hidden">{user.classNumber}. {user.profileNickname}</h1>
                <div className="bg-white rounded-lg flex items-center justify-center">
                    {user.profileTitle}
                </div>
            </div>
        </div>
    )
}