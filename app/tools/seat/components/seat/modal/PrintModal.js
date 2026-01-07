import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import _ from "lodash";
import { useReactToPrint } from "react-to-print";

export default function PrintModal({ value, deskStyle, result, displayData, classData }) {
    const [isReversal, setIsReversal] = useState(false);
    const contentRef = useRef(null);
    const onCancel = (e) => {
        e.preventDefault();
        document.getElementById("printModal").close();

    }
    const handlePrint = useReactToPrint({ contentRef });

    return (
        <div ref={contentRef}>
            <dialog id="printModal" className="modal" >
                <div className="modal-box min-w-[1000px] min-h-[600px] flex flex-col justify-between overflow-hidden">
                    <div className="flex justify-end print:hidden">
                        <div className="flex flex-col ">
                            <input
                                onChange={() => setIsReversal(!isReversal)}
                                type="checkbox"
                                checked={isReversal}
                                className="focus:outline-none toggle hover:bg-indigo-500 border-indigo-600 bg-indigo-500 checked:hover:bg-orange-400 checked:border-orange-500 checked:bg-orange-400 checked:text-orange-800"
                            />
                            <div className="text-center">{isReversal ? '반전' : '기본'}</div>
                        </div>
                    </div>
                    <div className={`transition-transform duration-200  ease-in-out ${isReversal ? "rotate-180" : ""}`}>
                        <div className={`flex mb-[32px] justify-center ${isReversal ? "rotate-180" : ""}`}>
                            <div className=" w-[320px] relative h-[116px] rounded-lg border-[10px] bg-green-700 border-amber-700 text-white flex justify-cneter items-center text-[0.9rem]">
                                <div className="w-[320px] h-[116px] outline-none  flex  text-[1.5rem] overflow-hidden p-[8px]" ></div>
                                <div className="absolute right-0 bottom-0">떠든 사람</div>
                            </div>
                        </div>
                        <table className=" m-4 min-w-[600px] min-h-[320px] flex justify-center items-center"
                        >
                            <thead>

                            </thead>
                            <tbody className="flex flex-col font-bold"
                                style={{ gap: deskStyle.gap }}>

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
                                                        style={{ width: deskStyle.width, height: deskStyle.height, backgroundColor: a.isSelected ? "red" : classData?.setting?.color ?? "#fdba74"  }}
                                                        className={`${a.isSelected ? "bg-red-500" : "bg-orange-200"} ${isReversal ? "rotate-180" : ""} text-[1rem]  flex select-none z-[999]  rounded-lg flex justify-center items-center flex-wrap overflow-hidden`}>
                                                        {/* {result && result[rowIndex] && result[rowIndex][colIndex]} */}
                                                        {classData?.setting?.result === 0
                                                            ? displayData?.[result?.[rowIndex]?.[colIndex]]?.[0]
                                                            : classData?.setting?.result === 1
                                                                ? displayData?.[result?.[rowIndex]?.[colIndex]]?.[1] + "." + displayData?.[result?.[rowIndex]?.[colIndex]]?.[0]
                                                                : displayData?.[result?.[rowIndex]?.[colIndex]]?.[1]}
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
                    </div>
                    <div className="flex justify-center mt-[16px] print:hidden">
                        <button onClick={handlePrint} className="btn bg-red-500 text-white mr-[8px]">프린트</button>
                        <button className="btn" onClick={onCancel}>취소</button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={onCancel}>close</button>
                </form>
            </dialog>
        </div>
    )
}