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


    // 

    return (
        <div>

            <SeatTemplate  />

        </div>




    )
}