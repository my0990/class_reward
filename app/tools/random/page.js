'use client'
import { fetchData } from "@/hooks/swrHooks";
import { useState, useEffect, useRef } from "react";
import _ from "lodash";
import { motion } from "framer-motion";
import Modal from "./components/Modal";
import util from "@/app/directory/dashboard/@teacher/home/utils/util";

export default function Random() {
    const { data: studentData, isLoading: isStudentLoading, isError: isStudentError } = fetchData('/api/fetchStudentData');
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    const [originalStudentArr, setOriginalStudentArr] = useState([]);
    const [pickedStudentArr, setPickedStudentArr] = useState([]);
    const [isClicked, setIsClicked] = useState(false);
    const [studentArr, setStudentArr] = useState([]);
    const [studentNum, setStudentNum] = useState(1);
    const [rotation, setRotation] = useState(0);

    const [isSend, setIsSend] = useState(false);
    const [isSelectedAll, setIsSelectedAll] = useState(false);



    const { onClick, selectAll, clearAll, onSend, onTake } = util({ setStudentArr, setIsSelectedAll, studentArr, setIsSend });
    const audioPool = useRef([]);
    const index = useRef(0);
    const timeoutIds = useRef([]);
    const playSound = () => {
        const audio = audioPool.current[index.current];
        audio.currentTime = 0;
        audio.play();
        index.current = (index.current + 1) % audioPool.current.length;
    };
    const clearAllTimeouts = () => {
        timeoutIds.current.forEach(clearTimeout);
        timeoutIds.current = [];
    };
    const pickRandomStudent = () => {


        if (originalStudentArr.length === 0) {
            if (isClicked === false) {
                alert('학생을 추가해주세요')
            } else {
                alert('모두 뽑았습니다')
                onRefresh();
            }
            return
        }
        setIsClicked(true)
        const shuffled = [...originalStudentArr].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, studentNum);

        // 원본에서 뽑힌 것 제외한 나머지 만들기
        const remain = originalStudentArr.filter(item => !selected.includes(item));

        // 상태 업데이트

        setStudentArr([]);
        clearAllTimeouts();
        setTimeout(() => {
            setStudentArr(prev => [...selected]);

            for (let i = 0; i < selected.length; i++) {
                const id = setTimeout(() => {
                    playSound();
                }, i * 310); // 150ms 간격으로 반복
                timeoutIds.current.push(id);
            }
        }, 50);


        setPickedStudentArr(prev => [...prev, ...selected]);
        setOriginalStudentArr(remain);
    }
    useEffect(() => {
        if (studentData) {

            setOriginalStudentArr(_.shuffle(studentData))

        }
    }, [studentData])

    const onRefresh = () => {

        setRotation((prev) => prev + 360);
        setStudentArr([]);
        setPickedStudentArr([]);
        setOriginalStudentArr(studentData);
        setIsClicked(false);

    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioPool.current = Array.from({ length: 5 }, () => new Audio('/pop.mp3'));
        }
    }, []);
    if (isStudentLoading || isClassLoading) return <div>Loading data...</div>;
    if (isStudentError || isClassError) return <div>Error loading data</div>;
    const { startExp, commonDifference } = classData.expTable;
    const { currencyName } = classData;
    const findLargestSumUnderTarget = (selectedStudent) => {

        let k = Math.floor((-2 * startExp + commonDifference + Math.sqrt((2 * startExp - commonDifference) ** 2 + 8 * commonDifference * selectedStudent.exp)) / (2 * commonDifference));
        let sumK = (k / 2) * (2 * startExp + (k - 1) * commonDifference);

        if (sumK > selectedStudent.exp) {
            return k
        } else {
            return k + 1
        }

    };
    return (
        <div className=" h-[100vh] flex justify-center items-center flex-col">
            {/* <div>{isClicked && selectedStudent.classNumber}</div> */}
            <div className="flex justify-between w-full text-[1.5rem] px-[16px] mt-[32px]">
                <div className="flex items-center">
                    나온 번호: {pickedStudentArr.map((a, i) => a.classNumber).sort((a, b) => Number(a) - Number(b)).join(', ')}
                </div>
                <div className="">

                    {/* <input type="checkbox" className="mr-[8px] cursor-pointer" id="dup" />
                    <label htmlFor="dup" className="cursor-pointer">중복</label> */}
                    <button onClick={onRefresh} style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0.5s ease-in-out" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-9 transition-all hover:scale-110">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>

                    </button>
                </div>
            </div>
            <div className="flex p-[8px]  justify-between w-full bg-orange-300">

                {isSelectedAll
                    ? <button className="btn bg-orange-500 text-white ml-[8px] border-0" onClick={clearAll}>모두 해제</button>
                    : <button className="btn bg-orange-500 text-white ml-[8px] border-0" onClick={selectAll}>모두 선택</button>}
                <div>
                    <button className="btn btn-success text-white mr-[16px] " onClick={onSend}>{classData?.currencyName} 보내기</button>
                    <button className="btn bg-red-500 border-0 text-white" onClick={onTake}>{classData?.currencyName} 빼앗기</button>
                </div>
            </div>
            <div className="h-[568px] w-full flex justify-center items-center bg-orange-300  py-[24px] flex-wrap overflow-y-scroll">

                {isClicked ?
                    studentArr.map((selectedStudent, i) => {
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ delay: i * 0.3, duration: 0.5, ease: "easeOut" }}
                            >
                                {/* <div key={i} onClick={() => document.getElementById('modal').showModal()}> */}
                                <div key={i} onClick={(e) => onClick(selectedStudent)}>
                                    <div className={`shadow-[4px_6px_0px_0px_#050071] w-[160px] p-[16px] m-[8px] bg-orange-200 rounded-xl cursor-pointer ${selectedStudent.isactive ? "bg-orange-500" : ""}`}>
                                        <div className="flex justify-between mb-[8px]">
                                            <div className="font-semibold">LV. {findLargestSumUnderTarget(selectedStudent)}</div>
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
                                </div>
                            </motion.div>
                        )
                    })
                    : <div className="text-[2rem]">뽑기 버튼을 클릭해주세요</div>}

            </div>
            <div className="bg-orange-300 mb-[32px] pb-[16px] w-full flex justify-end pr-[16px] text-[1.5rem]" style={{ color: originalStudentArr.length === 0 ? 'red' : null }}>남은 학생: {originalStudentArr.length}명</div>
            <div className="flex items-center mb-[32px]">
                <div onClick={() => setStudentNum(prev => prev > 1 ? prev - 1 : 1)} className="cursor-pointer transition-all hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-9">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>

                </div>
                {/* <button onClick={pickRandomStudent} className="mx-[16px] inline-flex items-center gap-2 transition duration-300 ease-linear 
                bg-[#5751E1] text-white text-lg font-semibold font-['Poppins',sans-serif] leading-[1.12] 
                px-8 py-4 text-center capitalize select-none rounded-full
                whitespace-nowrap hover:bg-red-500 hover:shadow-none">
                    {studentNum}명 뽑기</button> */}

                <motion.button
                    whileHover={{
                        backgroundColor: [
                            "#fcd34d",
                            "#fb7185",
                            "#a5f3fc",
                            "#c4b5fd",
                            "#bbf7d0",
                            "#fcd34d",
                        ],
                        color: "#000", // hover 시 텍스트를 검정으로 바꿔서 대비 좋게
                        scale: 1,
                        boxShadow: "0 0 20px rgba(255,255,255,0.7)",
                        transition: {
                            duration: 2,
                            repeat: Infinity,
                        },
                    }}
                    className="mx-[16px] select-none relative z-20 px-6 py-3 bg-yellow-300 text-black font-bold text-lg rounded-full shadow-md overflow-hidden"
                    onClick={pickRandomStudent}
                >
                    {studentNum}명 뽑기
                </motion.button>
                <div onClick={() => setStudentNum(prev => prev + 1)} className="cursor-pointer transition-all hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-9">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>


                </div>

            </div>
            {/* currencyName, targetStudent, clearAll */}
            <Modal targetStudent={studentArr.filter((a) => a.isactive === true)} studentArr={studentArr} isSend={isSend} currencyName={classData?.currencyName} clearAll={clearAll}/>
        </div>
    )
}