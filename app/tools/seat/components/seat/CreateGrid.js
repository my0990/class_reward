import SeatModal from "./modal/SeatModal";
import PrintModal from "./modal/PrintModal"
import { fetchData } from "@/hooks/swrHooks";
import { useState, useEffect, useRef } from "react";
import GroupModal from "../group/modal/GroupModal";
import Image from "next/image";
import { mutate } from "swr";
import _ from "lodash";
import { seatChangeStart, stop } from "./util/util"
import { motion, AnimatePresence } from "framer-motion";






export default function CreateGrid({ isModalOpen }) {
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    const { data: studentData, isLoading: isStudentLoading, isError: isStudentError } = fetchData('/api/fetchStudentData');
    const [count, setCount] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [running, setRunning] = useState(false);
    const [total, setTotal] = useState(0);
    const stopRef = useRef(false);
    const genRef = useRef(null);
    const [error, setError] = useState('');
    const [isFunc, setIsFunc] = useState(false);
    const mode = useRef(false);

    const [value, setValue] = useState([[]]);
    const startIndex = useRef('');
    const currentIndex = useRef('');
    const startTable = useRef([]);


    const [grid, setGrid] = useState([[{ isOpen: true, group: [] }]])
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (classData?.gridData) {
            const newGrid = classData?.gridData.map(row =>
                row.map(cell => ({
                    ...cell,            // 기존 키값 복사
                    isSelected: false   // 새 키 추가
                }))
            );
            setValue(newGrid)
        } else {
            setValue([[{ isOpen: true, isSelected: false }]])
        }

    }, [classData?.gridData])



    const isTouchEvent = (e) => {
        return 'ontouchstart' in window && e.type.startsWith('touch');
    }
    const isMouseEvent = (e) => {
        return e.nativeEvent instanceof MouseEvent;
    }
    const convertIndexToString = (rowIndex, colIndex) => {
        return `${rowIndex}-${colIndex}`;
    }
    const convertStringToIndex = (indexString) => {
        if (!indexString.includes('-')) {
            throw new Error('indexString must be in the format of "rowIndex-colIndex"');
        }

        return indexString.split('-').map(Number);
    }
    const getTableCellElement = (e) => {
        let target
        if (isTouchEvent(e) && e.touches) {
            const { clientX, clientY } = e.touches[0];
            target = document.elementFromPoint(clientX, clientY);
        } else if (isMouseEvent(e)) {
            target = e.target;
        }


        if (target instanceof HTMLTableCellElement && target.tagName === 'TD') {
            return target;
        }

        return null;
    }

    const getTableCellIndex = (e) => {
        let rowIndex = null;
        let colIndex = null;

        const target = getTableCellElement(e);
        if (!target) {
            return null;
        }

        if (target.parentNode instanceof HTMLTableRowElement) {
            const tr = target.parentNode;

            rowIndex = tr.sectionRowIndex;

            const tds = tr.querySelectorAll('td');

            for (let i = 0; i < tds.length; i++) {
                if (tds[i] === target) {
                    colIndex = i;
                    break;
                }
            }
        }

        if (rowIndex === null || colIndex === null) {
            return null;
        }

        return { rowIndex, colIndex };
    }
    const handleDragStart = (e) => {

        const index = getTableCellIndex(e);
        if (index === null) {
            return;
        }

        if (isMouseEvent(e) && e.buttons !== 1) {
            return;
        }

        if (isTouchEvent(e) && e.cancelable) {
            e.preventDefault();
        }

        const { rowIndex, colIndex } = index;
        if (isFunc === true) {
            setIsFunc(false);
        }

        startTable.current = value.map(row => row.slice());
        startIndex.current = convertIndexToString(rowIndex, colIndex);
        mode.current = !value[rowIndex][colIndex].isSelected;
        const newValue = _.cloneDeep(value)

        if (!newValue[rowIndex][colIndex].isOpen) {
            return
        }

        if (isDrawerOpen === false) {
            setIsDrawerOpen(true);
        }

        // if(newValue[rowIndex][colIndex].isOpen){
        newValue[rowIndex][colIndex].isSelected = mode.current;
        // }

        setValue(newValue);
    };

    const handleDragMove = (e) => {

        if (startIndex.current === '') {
            return;
        }

        if (isMouseEvent(e) && e.buttons !== 1) {
            return;
        }

        const index = getTableCellIndex(e);

        if (index === null) {
            return;
        }

        const { rowIndex, colIndex } = index;

        const indexString = convertIndexToString(rowIndex, colIndex);
        const isSameAsPrevIndex = indexString === currentIndex.current;

        if (isSameAsPrevIndex) {
            return;
        }

        currentIndex.current = indexString;

        const [startRowIndex, startColIndex] = convertStringToIndex(startIndex.current);
        const [minRow, maxRow] = [startRowIndex, rowIndex].sort((a, b) => a - b);
        const [minCol, maxCol] = [startColIndex, colIndex].sort((a, b) => a - b);


        const newValue = [...value];
        newValue.forEach((r, i) => {
            r.forEach((_, j) => {
                if (!newValue[i][j].isOpen) {
                    return
                }

                if (i < minRow || i > maxRow || j < minCol || j > maxCol) {
                    newValue[i][j].isSelected = startTable.current[i][j].isSelected;
                } else {

                    newValue[i][j].isSelected = mode.current;
                }
            });
        });

        setValue(newValue);
    };

    const handleDragEnd = (e) => {

        startIndex.current = '';
        currentIndex.current = '';
        startTable.current = [];
        mode.current = false;

        if (e.cancelable) {
            e.preventDefault();
        }
    }



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




    useEffect(() => {
        setResult(null)
    }, [grid, setGrid])

    useEffect(() => {
        if (!classData) return;

        // 누락된 key를 채워 넣기
        if (classData.gridData) {


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
        }

        // 캐시 갱신
        mutate(
            "/api/fetchClassData",
            (prev) => {
                return { ...prev, gridData: classData.gridData ?? [[{ isOpen: true, group: [], isSelected: false },]] }
            },
            false // 서버 요청 없이 즉시 반영
        );
    }, [classData]);



    const onGroupClick = () => {
        document.getElementById('groupModal').showModal();
        isModalOpen.current = true;
    }




    const onGroupAssign = (a) => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            setIsFunc(true);

            let updatedGrid = _.cloneDeep(value).map((row, rowIdx) =>
                row.map((cell, colIdx) => {
                    // const shouldUpdate = selectedCells.some(
                    //     pos => pos.row === rowIdx && pos.col === colIdx
                    // );
                    if (cell.isSelected) {
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
    const onGroupDelete = () => {
        if (isLoading) {
            return
        } else {
            setIsLoading(true);
            setIsFunc(true);
            let updatedGrid = _.cloneDeep(value).map((row, rowIdx) =>
                row.map((cell, colIdx) => {


                    if (cell.isSelected) {
                        cell.group = []
                    }
                    return cell;
                })
            )


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

    useEffect(() => {
        if (error !== '') {
            setTimeout(() => setError(''), 2000)
        }

    }, [error, setError])

    const onDrawerCancel = () => {
        setIsDrawerOpen(false);
        const newGrid = classData?.gridData.map(row =>
            row.map(cell => ({
                ...cell,            // 기존 키값 복사
                isSelected: false   // 새 키 추가
            }))
        );
        setValue(newGrid)
    }





    useEffect(() => {

        const hasSelected = value.some(row =>
            row.some(cell => cell.isSelected === true)
        );
        if (!hasSelected && !isFunc) {
            setIsDrawerOpen(false);

        }
    }, [value, setValue])

    const onSeatClick = () => {
        isModalOpen.current = true
        document.getElementById('seatModal').showModal()
    }

    const onPrintClick = () => {
        isModalOpen.current = true
        document.getElementById('printModal').showModal()
    }

    const onReset = () => {
        setResult(null);
        setIsStarted(false);
    }
    if (isClassLoading || isStudentLoading) return <div>Loading data...</div>;
    if (isClassError || isStudentError) return <div>Error loading data</div>;









    return (



        <div className="flex items-center justify-center flex-col" >
            <div className="flex justify-between w-full mb-[32px]" >
                <div title="설정" onClick={() => alert('준비중')} className="print:hidden w-[56px] cursor-pointer  h-[56px]  hover:scale-110 transition-all overflow-hidden p-[8px] rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[40px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>

                </div>
                <div className="flex">
                    <div title="프린트" onClick={onPrintClick} className="print:hidden w-[56px] cursor-pointer mr-[24px] h-[56px] bg-[#E7E1D7] flex justify-center items-center hover:scale-110 transition-all overflow-hidden p-[8px] rounded-full">
                        <div className="w-[32px] h-[32px]">
                            <Image
                                src="/printer.png"
                                alt="프린트"
                                width={100}
                                height={100}
                            />
                        </div>
                    </div>
                    <div title="책상 배열 설정" onClick={onSeatClick} className="print:hidden w-[56px] cursor-pointer mr-[24px] h-[56px] bg-[#E7E1D7] hover:scale-110 transition-all overflow-hidden p-[8px] rounded-full">
                        <Image
                            src="/chair.png"
                            alt="의자"
                            width={300}
                            height={200}
                        />

                    </div>
                    <div title="그룹 설정" onClick={onGroupClick} className="print:hidden w-[56px] cursor-pointer h-[56px] hover:scale-110 transition-all bg-red-300 rounded-full overflow-hidden">
                        <Image
                            src="/group.png"
                            alt="그룹"
                            width={300}
                            height={200}
                        />
                    </div>
                </div>
            </div>
            <div className="mb-[16px] cursor-pointer w-[320px] relative h-[116px] rounded-lg border-[10px] bg-green-700 border-amber-700 text-white flex justify-cneter items-center text-[0.9rem]">

                <div className="w-[320px] h-[116px] outline-none  flex  text-[1.5rem] overflow-hidden p-[8px]" contentEditable="true"></div>
                <div className="absolute right-0 bottom-0">떠든 사람</div>
            </div>
            <table className="m-4 min-w-[600px] min-h-[320px] flex justify-center items-center"

                onTouchStart={handleDragStart}
                onMouseDown={handleDragStart}
                onTouchMove={handleDragMove}
                onMouseOver={handleDragMove}
                onTouchEnd={handleDragEnd}
                onMouseUp={handleDragEnd}
            >
                <thead>

                </thead>
                <tbody className="flex flex-col"
                    style={{ gap: deskStyle.gap }}>
                    <AnimatePresence>
                        {value.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                style={{ gap: deskStyle.gap }}
                                className="flex"
                                transition={{ duration: 0.2 }}>
                                {row.map((a, colIndex) => {
                                    return (
                                        a.isOpen
                                            ? <td
                                                key={colIndex}
                                                style={{ width: deskStyle.width, height: deskStyle.height }}
                                                className={`${a.isSelected ? "bg-red-500" : "bg-orange-200"} text-[1rem]  flex select-none cursor-pointer z-[999]  rounded-lg flex justify-center items-center flex-wrap overflow-hidden`}>
                                                {isDrawerOpen ?
                                                    a.group.map((data, i) => {
                                                        return (
                                                            <div
                                                                onMouseDown={(e) => {
                                                                    // div 클릭 시 부모 td 기준 이벤트 전달
                                                                    e.stopPropagation(); // div 자체 이벤트 버블링 막음

                                                                    const tdElement = e.currentTarget.closest("td"); // 부모 td 찾기

                                                                    if (!tdElement) return;

                                                                    // td 기준 fake 이벤트 생성
                                                                    const fakeEvent = {
                                                                        ...e,
                                                                        target: tdElement,
                                                                        currentTarget: tdElement,
                                                                        nativeEvent: e.nativeEvent,
                                                                        preventDefault: () => e.preventDefault(),
                                                                        stopPropagation: () => e.stopPropagation()
                                                                    };

                                                                    handleDragStart(fakeEvent); // table 핸들러 호출
                                                                }}
                                                                key={i}
                                                                style={{ backgroundColor: classData?.groupData[data]?.groupColor }}
                                                                className=" w-[20px] h-[20px] rounded-full"></div>
                                                        )
                                                    })
                                                    :
                                                    <div key={a.id}>
                                                        <AnimatePresence>
                                                            {result && (
                                                                <motion.div
                                                                    key="text"
                                                                    initial={isStarted ? { opacity: 0, y: 0 } : null}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: 0 }}
                                                                    transition={{ duration: 0.5 }}
                                                                    className=" text-xl font-bold"

                                                                >
                                                                    {result[rowIndex][colIndex]}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>}

                                                {/* {!isDrawerOpen && result && result[rowIndex] && result[rowIndex][colIndex]?.userId} */}
                                            </td>
                                            : <td
                                                key={colIndex}
                                                style={{ width: deskStyle.width, height: deskStyle.height }}
                                                className={`select-none  z-[999] px-4 py-2 rounded-lg`} />
                                    )

                                })}
                            </tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>

            <div className="text-red-500 font-bold h-[24px]">
                {error}
            </div>
            {isStarted
                ? <button onClick={onReset} className="print:hidden mt-[32px] bg-red-500 py-[16px] px-[24px] rounded-full text-[1.2rem] text-white font-bold ">다시 뽑기</button>
                : <button onClick={(e) => seatChangeStart({ gridData: classData.gridData, groupData: classData.groupData, studentData: studentData, stopRef: stopRef, setRunning: setRunning, setTotal: setTotal, genRef: genRef, setProgress: setProgress, setResult: setResult, setIsStarted: setIsStarted, setError: setError })} className="mt-[32px] bg-orange-500 py-[16px] px-[24px] rounded-full text-[1.2rem] text-white font-bold ">자리배치 시작</button>}

            {/* <button onClick={handlePrint}>ddd</button> */}
            <SeatModal classData={classData} isModalOpen={isModalOpen} count={count} setCount={setCount} />
            <GroupModal isModalOpen={isModalOpen} />
            <PrintModal value={value} deskStyle={deskStyle} result={result} />
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
                    <li onClick={onGroupDelete} className="py-[8px] cursor-pointer transition-all hover:bg-orange-300  rounded-xl">
                        <div>
                            <div className="w-[24px] h-[24px] rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[24px]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>

                            </div>
                            <div>삭제하기</div>
                        </div>
                    </li>
                    <div className="mt-[32px]">
                        <li><button onClick={onDrawerCancel}>닫기</button></li>
                    </div>
                </ul>
            </div>
        </div>

    )
}