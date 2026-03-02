import GroupModal from "./modal/GroupModal";
import { useState } from "react";
import { fetchData } from "@/hooks/swrHooks";
import { useEffect } from "react";

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function CreateGroup({ grid, setGrid, deskStyle, isModalOpen }) {
  const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
  const { data: studentData, isLoading: isStudentLoading, isError: isStudentError } = fetchData('/api/fetchStudentData');

  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);


  const [result, setResult] = useState(null);

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

  const onClick = () => {
    document.getElementById('groupModal').showModal();
    isModalOpen.current = true;
  }





  const onGroupAssign = (a) => {
    console.log(a)
    setGrid(prevGrid =>
      prevGrid.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const shouldUpdate = selectedCells.some(
            pos => pos.row === rowIdx && pos.col === colIdx
          );
          if (shouldUpdate) {
            const alreadyHasItem = cell.group.includes(a);
            return alreadyHasItem
              ? cell
              : {
                ...cell,
                group: [...cell.group, a], // 배열 복사 후 push
              };
          }
          return cell;
        })
      )
    );
  };



  const onDrawerCancel = () => {
    setIsDrawerOpen(false);
    setSelectedCells([]);
  }

  useEffect(() => {
    if (selectedCells.length === 0) {
      setIsDrawerOpen(false);
    }
  }, [setSelectedCells, selectedCells])
  if (isClassLoading || isStudentLoading) return <div>Loading data...</div>;
  if (isClassError || isStudentError) return <div>Error loading data</div>;
  console.log(grid)


  const buildStudentGroupMap = () => {
    const map = {};
    for (const [gid, g] of Object.entries(classData.groupData)) {
      for (const student of g.groupMember) {
        if (!map[student._id]) map[student._id] = [];
        map[student._id].push(gid);
      }
    }
    return map;
  };

  const studentGroupMap = buildStudentGroupMap();
  console.log(studentGroupMap)

  const deepCloneDesks = (desks) =>
    desks.map((row) => row.map((cell) => ({ ...cell })));


  const getAssignableDesks = (studentId, currentDesks) => {

    const studentGroups = studentGroupMap[studentId] || [];
    const candidates = [];

    for (let r = 0; r < currentDesks.length; r++) {
      for (let c = 0; c < currentDesks[r].length; c++) {
        const desk = currentDesks[r][c];
        if (desk.assigned) continue;
        const ok =
          studentGroups.length === 0 ||
          studentGroups.every(g => desk.group.includes(g));

        if (ok) candidates.push({ r, c });
      }
    }

    return candidates;
  };

  const assignStudents = (index, desks) => {
    if (index >= studentData.length || index >= grid.length * grid[0].length) return desks; // 성공
    console.log(index)
    console.log(studentData.length)
    const student = studentData[index];
    const candidates = getAssignableDesks(student._id, desks);
    shuffle(candidates)
    console.log(candidates)
    for (const { r, c } of candidates) {
      const newDesks = deepCloneDesks(desks);
      newDesks[r][c].assigned = student;
      const result = assignStudents(index + 1, newDesks);
      if (result) return result; // 성공
    }

    return null; // 실패
  };
  const handleAssign = () => {

    const final = assignStudents(0, grid);
    setResult(final);
    console.log(final)
    setResult(final)
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
                  a.isOpen
                    ? <td
                      key={colIndex}
                      onClick={() => toggleCell(rowIndex, colIndex)}
                      style={{ width: deskStyle.width, height: deskStyle.height }}
                      className={`${isCellSelected(rowIndex, colIndex) ? "bg-red-500" : "bg-orange-400"} text-[1rem]  flex select-none cursor-pointer z-[999] px-4 py-2 rounded-lg`}>
                      {a.group.map((data, i) => {

                        return (
                          <div key={i} style={{backgroundColor: classData.groupData[data].groupColor}} className=" w-[20px] h-[20px] rounded-full">{ }</div>
                        )
                      })}
                        {result && result[rowIndex][colIndex]?.assigned.userId}
                    </td>
                    : <td
                      key={colIndex}
                      style={{ width: deskStyle.width, height: deskStyle.height }}
                      className={`select-none  z-[999] px-4 py-2 rounded-lg`} />
                )

              })}
            </tr>
          ))}
        </tbody>
      </table>

      <input id="my-drawer-4" type="checkbox" readOnly checked={isDrawerOpen} className="drawer-toggle" />

      <div className="drawer-side ">
        {/* <label htmlFor="my-drawer-4" aria-label="close sidebar" onClick={()=>setIsDrawerOpen(false)} className="drawer-overlay"></label> */}
        <ul className="menu bg-base-200 text-base-content h-full w-[200px] p-4">
          {/* Sidebar content here */}
          {classData.groupData && Object.keys(classData?.groupData).map((a, i) => {
            return (
              <li key={i} onClick={(e) => onGroupAssign(a)} className="py-[8px] cursor-pointer transition-all hover:bg-orange-300 pl-[8px] rounded-xl">{classData.groupData[a].groupName}</li>
            )
          })}
          <div className="mt-[32px]">
            <li className="bg-red-500 rounded-lg" ><button >확인</button></li>
            <li><button onClick={onDrawerCancel}>취소</button></li>
          </div>
        </ul>
      </div>
      {/* <div className="flex  ">
                <div className="drawer-content">
                    <label htmlFor="my-drawer-4" className="drawer-button btn btn-primary">그룹 만들기</label>
                </div>
            </div> */}
      <GroupModal isModalOpen={isModalOpen} />
      <button onClick={onClick} className="mt-[32px] bg-orange-500 py-[16px] px-[24px] rounded-full text-[1.2rem] text-white font-bold ">새로운 그룹 생성하기</button>
      <button onClick={handleAssign} className="mt-[32px] bg-orange-500 py-[16px] px-[24px] rounded-full text-[1.2rem] text-white font-bold ">자리배치 시작</button>
    </div>
  )
}