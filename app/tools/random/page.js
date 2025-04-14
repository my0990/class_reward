'use client'
import { fetchData } from "@/hooks/swrHooks";
import { useState, useEffect } from "react";
export default function Random() {
    const { data: studentData, isLoading: isStudentLoading, isError: isStudentError } = fetchData('/api/fetchStudentData');
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    const [numArr, setNumArr] = useState([]);
    const [isClicked, setIsClicked] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const pickRandomStudent = () => {
        if (studentData.length === 0) return;
        const randomIndex = Math.floor(Math.random() * studentData.length);
        setIsClicked(true);
        setSelectedStudent(studentData[randomIndex]);
    };


    useEffect(() => {
        if (studentData) {
            setNumArr(studentData)
        }
    }, [studentData])
    if (isStudentLoading || isClassLoading) return <div>Loading data...</div>;
    if (isStudentError || isClassError) return <div>Error loading data</div>;
    const { startExp, commonDifference } = classData.expTable;
    console.log(classData)
    const findLargestSumUnderTarget = () => {

        let k = Math.floor((-2 * startExp + commonDifference + Math.sqrt((2 * startExp - commonDifference) ** 2 + 8 * commonDifference * selectedStudent.exp)) / (2 * commonDifference));
        let sumK = (k / 2) * (2 * startExp + (k - 1) * commonDifference);

        if (sumK > selectedStudent.exp) {
            return k
        } else {
            return k + 1
        }

    };
    return (
        <div className="bg-orange-300 h-[100vh] flex justify-center items-center flex-col">
            {/* <div>{isClicked && selectedStudent.classNumber}</div> */}
            <div className="min-h-[400px] w-full flex justify-center items-center  flex-wrap">
                {isClicked &&
                    <div >
                        <div className="shadow-[4px_6px_0px_0px_#050071] w-[160px] p-[16px] m-[8px] bg-orange-200 rounded-xl cursor-pointer ">
                            <div className="flex justify-between mb-[8px]">
                                <div className="font-semibold">LV. {findLargestSumUnderTarget()}</div>
                                <div className="w-[80px] text-right overflow-hidden whitespace-nowrap"> </div>
                            </div>
                            <div className="flex overflow-hidden border-4 border-white justify-center items-center w-[110px] h-[110px] mb-[8px] mx-auto bg-white rounded-full">
                                <img src={selectedStudent.profileUrl} width="100" height="100" alt="characther" className="rounded-full" />
                            </div>
                            <h1 className="text-[1rem] font-bold text-center overflow-hidden">{selectedStudent.classNumber}. {selectedStudent.profileNickname}</h1>
                            <div className="bg-white rounded-lg flex items-center justify-center">
                                {selectedStudent.profileTitle}
                            </div>
                        </div>
                    </div>}
            </div>
            <div className="flex items-center">
                <div className="cursor-pointer transition-all hover:scale-110 w-[30px] h-[30px] p-[4px] border-2 border-black rounded-full flex justify-center items-center bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" /></svg>

                </div>
                <button onClick={pickRandomStudent} className="mx-[16px] inline-flex items-center gap-2 transition duration-300 ease-linear 
                bg-[#5751E1] text-white text-lg font-semibold font-['Poppins',sans-serif] leading-[1.12] 
                px-8 py-4 text-center capitalize select-none rounded-lg 
                whitespace-nowrap hover:bg-red-500 hover:shadow-none">1명 뽑기</button>
                <div className="cursor-pointer transition-all hover:scale-110 w-[30px] h-[30px] p-[4px] border-2 border-black rounded-full flex justify-center items-center bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" /></svg>
                </div>
            </div>
        </div>
    )
}