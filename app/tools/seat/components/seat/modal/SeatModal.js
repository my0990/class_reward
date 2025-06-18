import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SeatModal({ grid, setGrid, isModalOpen }) {
    const [value, setValue] = useState([[]]);
    const startIndex = useRef(''); 
    const currentIndex = useRef('');
    const startTable = useRef([]);
    const mode = useRef(false);

    const MotionTd = motion.td;
    const MotionTr = motion.tr;

    // 행 추가
    const addRow = () => {
        const newRow = Array(value[0].length).fill({isOpen: true, group:[]});
        setValue([...value, newRow]);


    };

    // 열 추가
    const addColumn = () => {
        const newValue = value.map(row => [...row, {isOpen: true, group: []}]);
        setValue(newValue);
        console.log(value)
    };

    // 행 제거
    const removeRow = () => {
        if (value.length > 1) {
            setValue(value.slice(0, -1));
        }
    };

    // 열 제거
    const removeColumn = () => {
        if (value[0].length > 1) {
            const newValue = value.map(row => row.slice(0, -1));
            setValue(newValue);
        }
    };

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
        console.log(value)
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

        startTable.current = value.map(row => row.slice());
        startIndex.current = convertIndexToString(rowIndex, colIndex);
        mode.current = !value[rowIndex][colIndex].isOpen;
        const newValue = [...value];
        newValue[rowIndex][colIndex].isOpen = mode.current;

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
                if (i < minRow || i > maxRow || j < minCol || j > maxCol) {
                    newValue[i][j].isOpen = startTable.current[i][j].isOpen;
                } else {
                    newValue[i][j].isOpen = mode.current;
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


    useEffect(() => {
        setValue(grid.map(row => row.slice()))
    }, [])



    const containerWidth = 900;
    const maxContainerHeight = 500;


    const [deskStyle, setDeskStyle] = useState({
        width: 0,
        height: 0,
        gap: 0,
        gridHeight: 0,
    });

    useEffect(() => {
        const rowCount = value.length;
        const colCount = value[0].length;
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
    }, [value, setValue]);

    const onClick = (e) => {
        e.preventDefault();
        setGrid(value.map(row => row.slice()));
        document.getElementById("seatModal").close();
    }

    const onCancel = (e) => {
        e.preventDefault();
        setValue(grid.map(row => row.slice()))
        document.getElementById("seatModal").close();
        isModalOpen.current = false;
    }



    return (
        <div>
            <dialog id="seatModal" className="modal">
                <div className="modal-box min-w-[1000px] min-h-[600px] flex flex-col justify-between">
                    <div className="flex justify-end">
                        <div className="flex items-center mr-[8px]">
                            <svg onClick={removeRow} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-9 cursor-pointer hover:scale-110 transition-all">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <div className="text-[1.5rem] mx-[8px]">행</div>
                            <svg onClick={addRow} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-9 cursor-pointer hover:scale-110 transition-all">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>

                        </div>
                        <div className="flex items-center">
                            <svg onClick={removeColumn} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-9 cursor-pointer hover:scale-110 transition-all">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <div className="text-[1.5rem] mx-[8px]">열</div>
                            <svg onClick={addColumn} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-9 cursor-pointer hover:scale-110 transition-all">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex justify-center w-full py-[24px] h-[564px] bg-blue-100 items-center">
                        <table className="m-4"
                            onTouchStart={handleDragStart}
                            onMouseDown={handleDragStart}
                            onTouchMove={handleDragMove}
                            onMouseOver={handleDragMove}
                            onTouchEnd={handleDragEnd}
                            onMouseUp={handleDragEnd}
                        >
                            <thead>

                            </thead>
                            <tbody style={{ gap: deskStyle.gap }} className="flex flex-col">
                                <AnimatePresence>
                                    {value.map((row, rowIndex) => (
                                        <MotionTr
                                            key={rowIndex}
                                            style={{ gap: deskStyle.gap }}
                                            className="flex"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            // exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}>
                                            {/* <th>

                                            </th> */}
                                            {row.map((a, i) => (
                                                <MotionTd
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    // exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    key={i}
                                                    style={{ width: deskStyle.width, height: deskStyle.height }}
                                                    className={`${a.isOpen ? "bg-orange-400" : "bg-gray-200"}  aspect-[2/1] select-none cursor-pointer    rounded-lg`}
                                                />
                                            ))}
                                        </MotionTr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-center mt-[16px]">
                        <form >
                            <button onClick={onClick} className="btn bg-red-500 text-white mr-[8px]">확인</button>
                        </form>
                        <form>
                            <button className="btn" onClick={onCancel}>취소</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={onCancel}>close</button>
                </form>
            </dialog>
        </div>
    )
}