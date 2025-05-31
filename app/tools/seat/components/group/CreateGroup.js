import GroupModal from "./GroupModal";
import { useState } from "react";
export default function CreateGroup({ grid, setGrid, deskStyle }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedCells, setSelectedCells] = useState([]);

    const toggleCell = (rowIndex, colIndex) => {
        setIsDrawerOpen(true)
        const cellKey = `${rowIndex}-${colIndex}`;
        const isSelected = selectedCells.some(
          (cell) => cell.row === rowIndex && cell.col === colIndex
        );
    
        if (isSelected) {
          // 이미 선택된 셀이면 제거
          setSelectedCells((prev) =>
            prev.filter((cell) => `${cell.row}-${cell.col}` !== cellKey)
          );
        } else {
          // 선택된 셀이 아니면 추가
          setSelectedCells((prev) => [...prev, { row: rowIndex, col: colIndex }]);
        }
      };
    
      const isCellSelected = (rowIndex, colIndex) => {
        return selectedCells.some(
          (cell) => cell.row === rowIndex && cell.col === colIndex
        );
      };
    return (
        <div className="flex items-center justify-center flex-col drawer drawer-end">

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
                            {row.map((a, colIndex) => {

                                return (
                                <td
                                    key={colIndex}
                                    onClick={() => toggleCell(rowIndex, colIndex)}
                                    style={{ width: deskStyle.width, height: deskStyle.height}}
                                    className={`${a ? isCellSelected(rowIndex, colIndex) ? "bg-red-500" :  "bg-orange-400" : ""} select-none cursor-pointer z-[999] px-4 py-2 rounded-lg`}></td>
                            )})}
                        </tr>
                    ))}
                </tbody>
            </table>

            <input id="my-drawer-4" type="checkbox" readOnly checked={isDrawerOpen} className="drawer-toggle" />

            <div className="drawer-side ">
                {/* <label htmlFor="my-drawer-4" aria-label="close sidebar" onClick={()=>setIsDrawerOpen(false)} className="drawer-overlay"></label> */}
                <ul className="menu bg-base-200 text-base-content h-full w-[200px] p-4">
                    {/* Sidebar content here */}
                    <li>Sidebar Item 1</li>
                    <li>Sidebar Item 2</li>
                    <li className="bg-red-500 rounded-lg" ><button >확인</button></li>
                    <li><button onClick={() => setIsDrawerOpen(false)}>취소</button></li>
                </ul>
            </div>
            {/* <div className="flex  ">
                <div className="drawer-content">
                    <label htmlFor="my-drawer-4" className="drawer-button btn btn-primary">그룹 만들기</label>
                </div>
            </div> */}
            <GroupModal />
            <button onClick={() => document.getElementById('groupModal').showModal()} className="mt-[32px] bg-orange-500 py-[16px] px-[24px] rounded-full text-[1.2rem] text-white font-bold ">새로운 그룹 생성하기</button>
        </div>
    )
}