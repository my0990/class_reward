'use client'

import lottieJson from "@/public/notification.json";
import dynamic from 'next/dynamic';
export default function Notification(){
    const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });
    return(
        <div className="w-[48px] h-[48px] cursor-pointer hover:scale-125 transition-transform ease-in-out duration-200">
            <Lottie
                loop
                animationData={lottieJson}
                play
            />
        </div>
    )
}