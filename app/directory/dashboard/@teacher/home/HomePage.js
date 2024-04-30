'use client'

import lottieJson from "@/public/pig.json"
import dynamic from 'next/dynamic';
import StudentInfoCard from "./components/StudentInfoCard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./components/Modal";
import InstallPrompt from "../../component/InstallPrompt";
export default function Home({data}) {
    const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });
    const [modalData,setModalData] = useState('data');

    const onClick = (a) => {
        document.getElementById('my_modal_2').showModal()
        setModalData(a)
    }
    let testData = [1]

    const route = useRouter();
    if(data.length === 0){
        return (
            <div className="w-full">
                <div className="flex flex-col items-center w-[60vw] h-[60vw] min-[600px]:w-[400px] min-[600px]:h-[300px]  mx-auto">
                    <Lottie
                        loop
                        animationData={lottieJson}
                        play
                    />
                    <span className=" text-[3vw] mt-[2vw] min-[600px]:text-[20px] dark:text-white">
                        등록된 학생이 없습니다. <button className="cursor-pointer z-0 text-blue-600 dark:text-blue-300" onClick={()=> route.push("../directory/qrcode")}>학생 등록하기</button>
                    </span>
                </div>
            </div>
        )
    } else {
    return (
        <div className="p-[32px] h-[calc(100vh-96px)]">
            <div className="grid min-[1300px]:grid-cols-10  min-[800px]:grid-cols-6  min-[550px]:grid-cols-4 min-[400px]:grid-cols-3  grid-cols-2  gap-[10px]  ">            
            {data.map((a,i)=>{
                return(
                    <StudentInfoCard key={i} onClick={(e)=>onClick(a)}>{a.userName}</StudentInfoCard>
                )
            })}</div>
            <Modal modalData = {modalData}/>
            <InstallPrompt />
        </div>
    )
}}