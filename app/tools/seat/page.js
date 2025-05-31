'use client'

import { useState, useEffect, useRef } from "react"
import SeatModal from "./components/modal/SeatModal";

import { LocomotiveScrollProvider } from "react-locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";
import SeatTemplate from "./components/SeatTemplate";
// const LocomotiveScroll = dynamic(() => import('react-locomotive-scroll'), { ssr: false })


export default function Seat() {
    const containerRef = useRef(null);
    return (
        <div>
            <LocomotiveScrollProvider
                options={{
                    smooth: true,
                    multiplier: 1,
                    lerp: 0.1,
                }}
                containerRef={containerRef}
                watch={[/* Dependencies */]}
            >
                <SeatTemplate containerRef={containerRef} />
            </LocomotiveScrollProvider >
        </div>




    )
}