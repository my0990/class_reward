import SeatModal from "./modal/SeatModal";

export default function CreateGrid({grid, setGrid, deskStyle, isModalOpen}) {


    const onClick = () => {
        isModalOpen.current = true
        document.getElementById('seatModal').showModal()
    }
    return (



        <div className="flex items-center justify-center flex-col" >
            <div className="mb-[16px] w-[320px] h-[116px] rounded-lg border-[10px] bg-green-700 border-amber-700 text-white flex justify-end items-end text-[0.9rem]">떠든 사람</div>
            <table className="m-4"
            >
                <thead>

                </thead>
                <tbody
                    className="flex flex-col"
                    style={{ gap: deskStyle.gap }}>
                    {grid.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            style={{ gap: deskStyle.gap }}
                            className="flex">
                            <th>

                            </th>
                            {row.map((a, i) => (
                                <td
                                    key={i}

                                    style={{ width: deskStyle.width, height: deskStyle.height }}
                                    className={`${a.isOpen ? "bg-orange-400" : ""} select-none  px-4 py-2 rounded-lg`}></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={onClick} className="mt-[32px] text-[1.2rem] bg-orange-500 py-[16px] px-[24px] rounded-full text-white font-bold ">새로운 대형 생성하기</button>
            <SeatModal grid={grid} setGrid={setGrid} isModalOpen={isModalOpen}/>
        </div>

    )
}