'use client'

import lottieJson from "@/public/notification.json";
import dynamic from 'next/dynamic';
import {useMemo } from "react";
export default function Notification() {
    const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });
    return (
        <div className=" cursor-pointer hover:scale-125 transition-transform ease-in-out duration-200 w-[64px] h-[64px]">
            {useMemo(() => {
                return (
                    <Lottie
                        loop
                        animationData={lottieJson}
                        play
                    />
                )
            },[])}
        </div>
    )
}

