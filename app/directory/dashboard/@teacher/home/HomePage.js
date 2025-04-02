'use client'

import StudentInfoCard from "./components/StudentInfoCard";
import { useState, useEffect } from "react";
import Modal from "./components/Modal";
import InstallPrompt from "../../component/InstallPrompt";
import SetCurrencyNameModal from "./components/SetCurrencyNameModal";


import { fetchData } from "@/hooks/swrHooks";
import util from './utils/util'

export default function Home() {
    const { data: studentData, isLoading: isStudentLoading, isError: isStudentError } = fetchData('/api/fetchStudentData');
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');


    const [isSend, setIsSend] = useState(false);
    const [isSelectedAll, setIsSelectedAll] = useState(false);
    const [studentArr, setStudentArr] = useState([]);
    const { onClick, selectAll, clearAll, onSend, onTake } = util({ setStudentArr, setIsSelectedAll, studentArr, setIsSend });
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (studentData) {
            const updatedData = studentData.map(obj => {
                return { ...obj, isactive: false }; // 새로운 키-값 쌍 추가하여 새로운 객체 반환
            });
            // 로컬 캐시 업데이트
            setStudentArr(updatedData)
        }
    }, [studentData]);



    useEffect(() => {
        if (classData && studentData) {
            if (!classData?.currencyEmoji || !classData?.currencyName)
                setIsModalOpen(true); // 특정 데이터가 없을 때 모달을 열도록
        }
    }, [classData, studentData, isClassLoading, isStudentLoading]);


    if (isStudentLoading || isClassLoading) return <div>Loading data...</div>;
    if (isStudentError || isClassError) return <div>Error loading data</div>;


    const {currencyEmoji, expTable} = classData;

    return (
        <div className=" pt-0 flex justify-center">

            <div className="w-[1410px] max-[1410px]:w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
                <div className="flex py-[16px] mr-[8px] justify-between">

                    {isSelectedAll
                        ? <button className="btn bg-orange-500 text-white ml-[8px] " onClick={clearAll}>모두 해제</button>
                        : <button className="btn bg-orange-500 text-white ml-[8px] " onClick={selectAll}>모두 선택</button>}
                    <div>
                        <button className="btn btn-success text-white mr-[16px] " onClick={onSend}>{classData?.currencyName} 보내기</button>
                        <button className="btn bg-red-500 text-white" onClick={onTake}>{classData?.currencyName} 빼앗기</button>
                    </div>
                </div>

                <div className=" flex flex-wrap">
                    {studentArr && studentArr.map((a, i) => {
                        return (
                            <StudentInfoCard  currencyEmoji={currencyEmoji} expTable={expTable} key={i} isactive={a.isactive ? 1 : 0} onClick={(e) => onClick(a)} data={a}>{a.classNumber}. {a.profileNickname}</StudentInfoCard>
                        )
                    })}</div>
            </div>

            <Modal targetStudent={studentArr.filter((a) => a.isactive === true)} studentArr={studentArr} isSend={isSend} currencyName={classData?.currencyName} clearAll={clearAll} />
            <InstallPrompt />
            {isModalOpen && <input type="checkbox" id="setting" className="modal-toggle" checked readOnly />}
            <SetCurrencyNameModal setIsModalOpen={setIsModalOpen} />

        </div>
    )
}
// }