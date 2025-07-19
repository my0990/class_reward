import SeatModal from "./modal/SeatModal";
import { fetchData } from "@/hooks/swrHooks";
import { useState, useEffect } from "react";
import GroupModal from "../group/modal/GroupModal";
import Image from "next/image";
import { mutate } from "swr";
import _ from "lodash";
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function CreateGrid({ isModalOpen }) {
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    const { data: studentData, isLoading: isStudentLoading, isError: isStudentError } = fetchData('/api/fetchStudentData');
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [deskStyle, setDeskStyle] = useState({
        width: 0,
        height: 0,
        gap: 0,
        gridHeight: 0,
    });

    const containerWidth = 900;
    const maxContainerHeight = 500;

    useEffect(() => {
        const rowCount = classData?.gridData ? classData?.gridData.length : 0;
        const colCount = classData?.gridData ? classData?.gridData[0].length : 0;
        // 1. 기본 gap, 비율
        const baseGap = 16;
        const deskRatio = 2 / 1;

        // 2. 가로 공간 계산: 책상 개수 + gap 개수
        const rowTotalWidth = colCount * 100 + (colCount - 1) * baseGap;

        // 3. 가로 scale 계산
        const scaleX = containerWidth / rowTotalWidth;

        // 4. 책상 가로/세로/간격 계산 (세로는 추후 scaleY와 비교)


        // 5. 세로 총 높이
        const totalHeight = rowCount * 50 + (rowCount - 1) * baseGap;
        const scaleY = maxContainerHeight / totalHeight;

        // 6. 최종 scale (비율 유지 위해 두 축 중 작은 값 선택)
        const scale = Math.min(scaleX, scaleY, 1);

        // 7. 최종 반영
        setDeskStyle({
            width: 100 * scale,
            height: 50 * scale,
            gap: baseGap * scale,
            gridHeight: Math.min(
                rowCount * ((100 / deskRatio) * scale) + (rowCount - 1) * (baseGap * scale),
                maxContainerHeight
            ),
        });
    }, [classData?.gridData]);

    const [grid, setGrid] = useState([[{ isOpen: true, group: [] }]])

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedCells, setSelectedCells] = useState([]);


    const [result, setResult] = useState(null);


    useEffect(() => {
        setResult(null)
    }, [grid, setGrid])

    useEffect(() => {
        if (!classData) return;

        // 누락된 key를 채워 넣기
        let tmp = 0;
        for (let r = 0; r < classData.gridData.length; r++) {
            for (let c = 0; c < classData.gridData[r].length; c++) {
                const desk = classData.gridData[r][c];
                if (desk.isOpen) {
                    tmp++
                }
            }
        }
        setCount(tmp)

        // 캐시 갱신
        mutate(
            "/api/fetchClassData",
            (prev) => {
                return { ...prev, gridData: classData.gridData ?? [[{ isOpen: true, group: [] }, { isOpen: true, group: [] }]] }
            },
            false // 서버 요청 없이 즉시 반영
        );
    }, [classData]);


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

    const onGroupClick = () => {
        document.getElementById('groupModal').showModal();
        isModalOpen.current = true;
    }




    const onGroupAssign = (a) => {

        if (isLoading) {
            return
        } else {
            setIsLoading(true)

            let updatedGrid = _.cloneDeep(classData.gridData).map((row, rowIdx) =>
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
            console.log(updatedGrid)

            fetch("/api/assignGroupToGrid", {
                method: "POST",
                body: JSON.stringify({ updatedGrid: updatedGrid }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {


                    setIsLoading(false);
                    mutate(
                        "/api/fetchClassData",
                        (prev) => {

                            return { ...prev, gridData: updatedGrid }
                        },
                        false // 서버 요청 없이 즉시 반영
                    );

                }
            })
        }

    }
    // const onGroupAssign = (a) => {
    //     console.log(a)
    //     mutate()
    //     setGrid(prevGrid =>
    //         prevGrid.map((row, rowIdx) =>
    //             row.map((cell, colIdx) => {
    //                 const shouldUpdate = selectedCells.some(
    //                     pos => pos.row === rowIdx && pos.col === colIdx
    //                 );
    //                 if (shouldUpdate) {
    //                     const alreadyHasItem = cell.group.includes(a);
    //                     return alreadyHasItem
    //                         ? cell
    //                         : {
    //                             ...cell,
    //                             group: [...cell.group, a], // 배열 복사 후 push
    //                         };
    //                 }
    //                 return cell;
    //             })
    //         )
    //     );
    // };



    const onDrawerCancel = () => {
        setIsDrawerOpen(false);
        setSelectedCells([]);
    }

    useEffect(() => {
        if (selectedCells.length === 0) {
            setIsDrawerOpen(false);
        }
    }, [setSelectedCells, selectedCells])

    const onSeatClick = () => {
        isModalOpen.current = true
        document.getElementById('seatModal').showModal()
    }


    if (isClassLoading || isStudentLoading) return <div>Loading data...</div>;
    if (isClassError || isStudentError) return <div>Error loading data</div>;

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
        console.log(index)
        if (index >= studentData.length || index >= count) return desks; // 성공
        const student = studentData[index];
        const candidates = getAssignableDesks(student._id, desks);
        if (candidates.length === 0) {
            console.log(candidates, student.userId)
        }
        shuffle(candidates)

        for (const { r, c } of candidates) {
            const newDesks = deepCloneDesks(desks);
            if (!newDesks[r][c].isOpen) continue
            newDesks[r][c].assigned = student;

            const result = assignStudents(index + 1, newDesks);
            if (result) return result; // 성공
        }

        return null; // 실패
    };
    const handleAssign = () => {

        const final = assignStudents(0, classData.gridData);
        setResult(final);
        console.log(final)
        setResult(final)
    };
    return (



        <div className="flex items-center justify-center flex-col" >
            <div className="flex justify-end w-full mb-[32px]">
                <div title="책상 배열 설정" onClick={onSeatClick} className="w-[56px] cursor-pointer mr-[24px] h-[56px] bg-[#E7E1D7] hover:scale-110 transition-all overflow-hidden p-[8px] rounded-full">
                    <Image
                        src="/chair.png"
                        alt="설명"
                        width={300}
                        height={200}
                    />

                </div>
                <div title="그룹 설정" onClick={onGroupClick} className="w-[56px] cursor-pointer h-[56px] hover:scale-110 transition-all bg-red-300 rounded-full overflow-hidden">
                    <Image
                        src="/group.png"
                        alt="설명"
                        width={300}
                        height={200}
                    />
                </div>
            </div>
            <div className="mb-[16px] cursor-pointer w-[320px] relative h-[116px] rounded-lg border-[10px] bg-green-700 border-amber-700 text-white flex justify-cneter items-center text-[0.9rem]">

                <div className="w-[320px] h-[116px] outline-none  flex  text-[1.5rem] overflow-hidden p-[8px]" contentEditable="true"></div>
                <div className="absolute right-0 bottom-0">떠든 사람</div>
            </div>
            <table className="m-4 min-w-[600px] min-h-[320px] flex justify-center items-center" >
                <thead>

                </thead>
                <tbody
                    className="flex flex-col"
                    style={{ gap: deskStyle.gap }}>

                    {classData.gridData && classData.gridData.map((row, rowIndex) => (
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
                                            className={`${isCellSelected(rowIndex, colIndex) ? "bg-red-500" : "bg-orange-200"} text-[1rem]  flex select-none cursor-pointer z-[999]  rounded-lg flex justify-center items-center flex-wrap overflow-hidden`}>
                                            {a.group.map((data, i) => {

                                                return (
                                                    isDrawerOpen ? <div key={i} style={{ backgroundColor: classData.groupData[data].groupColor }} className=" w-[20px] h-[20px] rounded-full"></div> : null
                                                )
                                            })}
                                            {!isDrawerOpen && result && result[rowIndex] && result[rowIndex][colIndex]?.assigned?.userId}
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
            <button onClick={handleAssign} className="mt-[32px] bg-orange-500 py-[16px] px-[24px] rounded-full text-[1.2rem] text-white font-bold ">자리배치 시작</button>

            <SeatModal classData={classData} isModalOpen={isModalOpen} count={count} setCount={setCount} />
            <GroupModal isModalOpen={isModalOpen} />
            <input id="my-drawer-4" type="checkbox" readOnly checked={isDrawerOpen} className="drawer-toggle" />

            <div className="drawer-side">
                <ul className="menu bg-base-200 text-base-content h-full w-[200px] p-4">
                    {/* Sidebar content here */}
                    {classData.groupData && Object.keys(classData?.groupData).map((a, i) => {
                        return (
                            <li key={i} onClick={(e) => onGroupAssign(a)} className="py-[8px] cursor-pointer transition-all hover:bg-orange-300  rounded-xl">
                                <div>
                                    <div style={{ backgroundColor: classData.groupData[a].groupColor }} className="w-[24px] h-[24px] rounded-full"></div>
                                    <div>{classData.groupData[a].groupName}</div>
                                </div>
                            </li>
                        )
                    })}
                    <div className="mt-[32px]">
                        <li><button onClick={onDrawerCancel}>닫기</button></li>
                    </div>
                </ul>
            </div>
        </div>

    )
}