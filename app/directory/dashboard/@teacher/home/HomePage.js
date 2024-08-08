'use client'

import lottieJson from "@/public/pig.json"
import dynamic from 'next/dynamic';
import StudentInfoCard from "./components/StudentInfoCard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "./components/Modal";
import InstallPrompt from "../../component/InstallPrompt";
import SetCurrencyNameModal from "./components/SetCurrencyNameModal";

export default function Home({ data, classData}) {
    const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });
    let tmpData = data.map(obj => {
        return { ...obj, isActive: false }; // 새로운 키-값 쌍 추가하여 새로운 객체 반환
    });
    const [isSend,setIsSend] = useState(false);
    const [studentData,setStudentData] = useState(tmpData);
    const onClick = (a) => {
        // document.getElementById('my_modal_2').showModal()
        setStudentData((prev) => {
            return prev.map(obj=> 
                obj._id === a._id ? { ...obj, isActive: !a.isActive } : obj
            );
        });
        console.log(studentData)
    }
    useEffect(()=>{
        if(!classData){
            document.getElementById('my_modal_1').showModal();

        }
    })
    const route = useRouter();
    const onSend = () => {
        if(targetStudent.length === 0){
            alert('학생을 선택해주세요')
            return
        }
        setIsSend(true);
        document.getElementById('my_modal_2').showModal();
    }
    const onTake = () => {
        if(targetStudent.length === 0){
            alert('학생을 선택해주세요')
            return
        }
        setIsSend(false);
        document.getElementById('my_modal_2').showModal();
    }
    const targetStudent = studentData.filter((a) => a.isActive === true)
    if (data.length === 0) {
        return (
            <div className="w-full">
                <div className="flex flex-col items-center w-[60vw] h-[60vw] min-[600px]:w-[400px] min-[600px]:h-[300px]  mx-auto">
                    <Lottie
                        loop
                        animationData={lottieJson}
                        play
                    />
                    <span className=" text-[3vw] mt-[2vw] min-[600px]:text-[20px] dark:text-white">
                        등록된 학생이 없습니다. <button className="cursor-pointer z-0 text-blue-600 dark:text-blue-300" onClick={() => route.push("../directory/qrcode")}>학생 등록하기</button>
                    </span>
                </div>
            </div>
        )
    } else {
        return (
            <div className="p-[32px] pt-0">
                <div className="flex py-[16px] justify-end">
                    <button className="btn btn-success text-white mr-[16px] " onClick={onSend}>{classData?.currencyName} 보내기</button>
                    <button className="btn bg-red-500 text-white" onClick={onTake}>{classData?.currencyName} 빼앗기</button>
                </div>
                <div className="grid min-[1300px]:grid-cols-10  min-[800px]:grid-cols-6  min-[550px]:grid-cols-4 min-[400px]:grid-cols-3  grid-cols-2  gap-[10px]">
                    {studentData.map((a, i) => {
                        return (
                            <StudentInfoCard key={i} isActive={a.isActive}  onClick={(e) => onClick(a)} data={a}>{a.classNumber}. {a.profileNickname}</StudentInfoCard>
                        )
                    })}</div>
                {/* {modalData.length !== 0 ? <Modal modalData={modalData} /> : null} */}
                <Modal targetStudent = {targetStudent } isSend={isSend} setStudentData={setStudentData} studentData={studentData} currencyName={classData?.currencyName}/>
                <InstallPrompt />
                {classData ? null : <SetCurrencyNameModal />}

            </div>
        )
    }
}