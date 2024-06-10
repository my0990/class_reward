'use client'
import lottieJson from "@/public/tangerine.json"
import dynamic from 'next/dynamic';
import Typewriter from 'typewriter-effect'; 
export default function GuideTemplate() {
    const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });
    return (
        <div className="flex justify-center items-center h-[100vh]">
            <div className="w-[500px] h-[400px] relative">
                <Lottie
                    loop
                    animationData={lottieJson}
                    play
                />
                <div className="absolute top-0">
                <Typewriter
                    options={{
                        strings: ['안녕하세요. 학급 보상 관리 시스템 뀰입니다. 뀰!!!!!!!!', '뀰!!!!'],
                        autoStart: true,
                        wrapperClassName: "typeWriter",
                        loop: true,
                    }}
                />
                </div>
            </div>
        </div>
    )
}