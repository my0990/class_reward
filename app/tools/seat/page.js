'use client'

import { useState, useEffect, useRef } from "react"
import SeatModal from "./components/seat/modal/SeatModal";

import { LocomotiveScrollProvider } from "react-locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";
import SeatTemplate from "./components/SeatTemplate";
import LoadingOverlay from "./components/LoadingOverlay";
import { fetchData } from "@/hooks/swrHooks";

export default function Seat() {
    // const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    const containerRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    // 

    return (
        <div>
            {!isReady && <LoadingOverlay />}
            <LocomotiveScrollProvider
                options={{
                    smooth: true,
                    multiplier: 1,
                    lerp: 0.1,
                }}
                containerRef={containerRef}
                watch={[/* Dependencies */]}
                onUpdate={() => {
                    // 스크롤이 설정된 후 로딩 해제
                    setTimeout(() => {
                        document.body.classList.add('allow-scroll');
                        setIsReady(true);
                    }, 300);
                }}
            >
                <SeatTemplate containerRef={containerRef} />
            </LocomotiveScrollProvider >
        </div>




    )
}