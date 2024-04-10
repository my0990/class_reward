'use client'

import lottieJson from "@/public/pig.json"
import dynamic from 'next/dynamic';
import StudentInfoCard from "./components/StudentInfoCard";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Home({data}) {
    const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });
    const [modalData,setModalData] = useState('data');
    const [point,setPoint] = useState(0);
    const onClick = (a) => {
        document.getElementById('my_modal_2').showModal()
        setModalData(a)
    }
    let testData = [1]
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/givePoint", {
            method: "POST",
            body: JSON.stringify({userId: modalData.userId, point: point}),
            headers: {
              "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if(data.result === true){
                alert(modalData.userName + '에게 포인트 ' + point + '개를 지급하였습니다.');
                setPoint(0);
                document.getElementById('my_modal_2').close()


            }
        })}
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
                    <span className=" text-[3vw] mt-[2vw] min-[600px]:text-[20px] ">
                        등록된 학생이 없습니다. <button className="cursor-pointer z-0 text-blue-600" onClick={()=> route.push("../directory/qrcode")}>학생 등록하기</button>
                    </span>
                </div>
            </div>
        )
    } else {
    return (
        <div className="p-[32px]">


            <div className="grid min-[1300px]:grid-cols-10  min-[800px]:grid-cols-6  min-[550px]:grid-cols-4 min-[400px]:grid-cols-3  grid-cols-2  gap-[10px]  ">            
            {testData.map((a,i)=>{
                return(
                    <StudentInfoCard key={i} onClick={(e)=>onClick(a)}>{a.userName}</StudentInfoCard>
                )
            })}</div>
            <dialog id="my_modal_2" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-5">{modalData.userName}에게</h3>
                    <ul className="flex">
                        {[1,2,3,5,10].map((a,i)=>{
                            return(
                                <button key={i} onClick={()=>setPoint(pres => pres + a)} className="btn btn-square bg-orange-300 text-[1.5rem] text-white mr-5 focus:outline-none">{a}</button>
                            )
                        })}

                    </ul>
                    <div className="text-[3rem] mt-5">{point}개 보내기</div>
                    <div className="modal-action mt-0">
                        <form onSubmit={onSubmit}> 
                            <button className="btn">확인</button>
                        </form>
                        <form method="dialog">
                            <button onClick={()=>setTimeout(()=>setPoint(0),500)} className="btn">Close</button>
                        </form>
                    </div>
                    </div>
                <form method="dialog" className="modal-backdrop" >
                    <button onClick={()=>setTimeout(()=>setPoint(0),200)}>close</button>
                </form>
            </dialog>

        </div>
    )
}}