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
    const {  startExp, commonDifference } = classData.expTable;
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
        <div className="bg-orange-300 h-[100vh]">
            {/* <div>{isClicked && selectedStudent.classNumber}</div> */}
            {isClicked &&
                <div>
                    <div className="w-[160px] p-[16px] m-[8px] bg-orange-200 rounded-xl cursor-pointer ">
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

            <button onClick={pickRandomStudent} className="btn">뽑기</button>
        </div>
    )
}