'use client'
// import Lottie from 'react-lottie-player'
import lottieJson from "@/public/pig.json"
import dynamic from 'next/dynamic';
import StudentInfoCard from "./components/StudentInfoCard";
import { useState } from "react";
export default function Home() {
    const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });
    let data = ['새로운','장난감','이탕','강지현','이명권','이재철','김수철','최용만','이상국','a','b']
    const [modalData,setModalData] = useState('data');
    const [point,setPoint] = useState(0);
    const onClick = (a) => {
        document.getElementById('my_modal_2').showModal()
        setModalData(a)
    }
    return (
        <div >
            {/* <div className="w-full">
                <div className="flex flex-col items-center w-[60vw] h-[60vw] min-[600px]:w-[400px] min-[600px]:h-[300px]  mx-auto">
                    <Lottie
                        loop
                        animationData={lottieJson}
                        play
                    />
                    <span className=" text-[3vw] mt-[2vw] min-[600px]:text-[20px] ">
                        등록된 학생이 없습니다. <button className="cursor-pointer z-0 text-blue-600 ">학생 등록하기</button>
                    </span>
                </div>
            </div> */}

            <div className="grid min-[1300px]:grid-cols-10 min-[1300px]:w-[1290px] min-[800px]:grid-cols-6 min-[800px]:w-[780px] min-[550px]:grid-cols-4 min-[550px]:w-[510px] min-[400px]:grid-cols-3 min-[400px]:w-[380px] grid-cols-2 w-[250px] gap-[10px] mx-auto ">            
            {data.map((a,i)=>{
                return(
                    <StudentInfoCard key={i} onClick={(e)=>onClick(a)}>{a}</StudentInfoCard>
                )

            })}</div>
            <dialog id="my_modal_2" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-5">{modalData}에게</h3>
                    <ul className="flex">
                        {[1,2,3,5,10].map((a,i)=>{
                            return(
                                <button onClick={()=>setPoint(pres => pres + a)} className="btn btn-square bg-orange-300 text-[1.5rem] text-white mr-5 focus:outline-none">{a}</button>
                            )
                        })}

                    </ul>
                    <div className="text-[3rem] mt-5">{point}개 보내기</div>
                    <div className="modal-action mt-0">
                        <button className="btn">확인</button>
                        <form method="dialog">
                            {/* if there is a button, it will close the modal */}
                            <button onClick={()=>setTimeout(()=>setPoint(0),500)} className="btn">Close</button>
                        </form>
                    </div>           
                    </div>
                <form method="dialog" className="modal-backdrop" >
                    <button onClick={()=>setTimeout(()=>setPoint(0),500)}>close</button>
                </form>
            </dialog>

        </div>
    )
}