export default function DonationList({ thermoData, currencyName, studentData }) {
    const { donators } = thermoData;
    const userMap = studentData.reduce((acc, user) => {
        acc[user.userId] = user.profileNickname;
        return acc;
    }, {});
    let sortedDonators
    if (donators) {
        sortedDonators = Object.fromEntries(
            Object.entries(donators).sort((a, b) => b[1] - a[1]) // 값 기준 내림차순 정렬
        );
    }

    return (
        <div className="w-[320px] max-[647px]:w-auto h-[450px] overflow-auto">
            <div className="overflow-x-auto">
                <table className="table ">

                    <tbody>
                        {/* row 1 */}
                        {donators ? Object.keys(sortedDonators).map((a, i) => {
                            return (
                                <tr key={i}>
                                    <th className="text-center">{i + 1}위</th>
                                    <td className="text-center">{userMap[a]}<br />&#40;{a}&#41;</td>
                                    <td className="text-center">{sortedDonators[a]} {currencyName}</td>
                                </tr>
                            )
                        }) : null}

                    </tbody>
                </table>
            </div>
        </div>
    )
}