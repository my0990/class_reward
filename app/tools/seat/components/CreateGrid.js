import SeatModal from "./modal/SeatModal";
import { useState, useEffect } from "react";
export default function CreateGrid({grid, setGrid, deskStyle}) {



    // const [deskStyle, setDeskStyle] = useState({
    //     width: 0,
    //     height: 0,
    //     gap: 0,
    //     gridHeight: 0,
    // });

    // const containerWidth = 900;
    // const maxContainerHeight = 500;
    // useEffect(() => {

    //     const rowCount = grid.length;
    //     const colCount = grid[0].length;
    //     // 1. 기본 gap, 비율
    //     const baseGap = 16;
    //     const deskRatio = 2 / 1;

    //     // 2. 가로 공간 계산: 책상 개수 + gap 개수
    //     const rowTotalWidth = colCount * 100 + (colCount - 1) * baseGap;

    //     // 3. 가로 scale 계산
    //     const scaleX = containerWidth / rowTotalWidth;

    //     // 4. 책상 가로/세로/간격 계산 (세로는 추후 scaleY와 비교)


    //     // 5. 세로 총 높이
    //     const totalHeight = rowCount * 50 + (rowCount - 1) * baseGap;
    //     const scaleY = maxContainerHeight / totalHeight;

    //     // 6. 최종 scale (비율 유지 위해 두 축 중 작은 값 선택)
    //     const scale = Math.min(scaleX, scaleY, 1);

    //     // 7. 최종 반영
    //     setDeskStyle({
    //         width: 100 * scale,
    //         height: 50 * scale,
    //         gap: baseGap * scale,
    //         gridHeight: Math.min(
    //             rowCount * ((100 / deskRatio) * scale) + (rowCount - 1) * (baseGap * scale),
    //             maxContainerHeight
    //         ),
    //     });
    // }, [grid, setGrid]);
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
                                    className={`${a ? "bg-orange-400" : ""} select-none  px-4 py-2 rounded-lg`}></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => document.getElementById('seatModal').showModal()} className="mt-[32px] text-[1.2rem] bg-orange-500 py-[16px] px-[24px] rounded-full text-white font-bold ">새로운 대형 생성하기</button>
            <SeatModal grid={grid} setGrid={setGrid} />
        </div>

    )
}