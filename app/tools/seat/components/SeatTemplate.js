"use client";

import { useState, useEffect, useRef } from "react";

import CreateGrid from "./seat/CreateGrid";



export default function SeatTemplate({  }) {

    const isModalOpen = useRef(false);
    const [grid, setGrid] = useState([[{ isOpen: true, group: [] }]]);






 


    return (

        <div className="h-[100vh] flex items-center justify-center">
            <CreateGrid grid={grid} setGrid={setGrid}  isModalOpen={isModalOpen} />
        </div>
    )
}