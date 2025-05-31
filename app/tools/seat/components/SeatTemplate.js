"use client";

import { useState, useEffect, useRef } from "react";
import { useLocomotiveScroll } from "react-locomotive-scroll";

import CreateGrid from "./CreateGrid";
import FirstPage from "./FirstPage";
import CreateGroup from "./group/CreateGroup";
export default function SeatTemplate({ containerRef }) {


    const [grid, setGrid] = useState([
        [true, true, false, true, true, false, true, true],
        [true, true, false, true, true, false, true, true],
        [true, true, false, true, true, false, true, true],
        [true, true, false, true, true, false, true, true],
    ]);

    const [deskStyle, setDeskStyle] = useState({
        width: 0,
        height: 0,
        gap: 0,
        gridHeight: 0,
    });

    const containerWidth = 900;
    const maxContainerHeight = 500;
    useEffect(() => {

        const rowCount = grid.length;
        const colCount = grid[0].length;
        // 1. 기본 gap, 비율
        const baseGap = 16;
        const deskRatio = 2 / 1;

        // 2. 가로 공간 계산: 책상 개수 + gap 개수
        const rowTotalWidth = colCount * 100 + (colCount - 1) * baseGap;

        // 3. 가로 scale 계산
        const scaleX = containerWidth / rowTotalWidth;

        // 4. 책상 가로/세로/간격 계산 (세로는 추후 scaleY와 비교)


        // 5. 세로 총 높이
        const totalHeight = rowCount * 50 + (rowCount - 1) * baseGap;
        const scaleY = maxContainerHeight / totalHeight;

        // 6. 최종 scale (비율 유지 위해 두 축 중 작은 값 선택)
        const scale = Math.min(scaleX, scaleY, 1);

        // 7. 최종 반영
        setDeskStyle({
            width: 100 * scale,
            height: 50 * scale,
            gap: baseGap * scale,
            gridHeight: Math.min(
                rowCount * ((100 / deskRatio) * scale) + (rowCount - 1) * (baseGap * scale),
                maxContainerHeight
            ),
        });
    }, [grid, setGrid]);

    const { scroll } = useLocomotiveScroll();

    const isScrolling = useRef(false);
    const currentIndex = useRef(0);
    const sections = [
        { id: "section1", title: "Section 1", color: "#4CAF50" },
        { id: "section2", title: "Section 2", color: "#2196F3" },
        { id: "section3", title: "Section 3", color: "#FF5722" },
    ];




    useEffect(() => {
        if (!scroll) return;
        scroll.stop();
        const handleWheel = (e) => {

            if (isScrolling.current) {

                return
            } // 중첩 방지

            isScrolling.current = true;

            const direction = e.deltaY > 0 ? 1 : -1;
            const nextIndex = currentIndex.current + direction;
            // 범위 체크
            if (nextIndex < 0 || nextIndex >= sections.length) {
                isScrolling.current = false;
                return;
            }

            currentIndex.current = nextIndex;
            const element = document.getElementById(sections[nextIndex].id);
            // scroll.scrollTo(target, options)
            scroll.scrollTo(element, {
                duration: 500,
                offset: 0,
                easing: [0.25, 0.0, 0.35, 1.0],
                callback: () => {
                    isScrolling.current = false; // 애니메이션 끝나면 해제
                },
            });
        };

        window.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            window.removeEventListener("wheel", handleWheel);
        };
    }, [scroll, isScrolling]);
    return (

        <div data-scroll-container ref={containerRef}>
            {sections.map((section, index) => (
                <section
                    key={section.id}
                    id={section.id}
                    data-scroll-section
                    className="section"
                    style={{
                        height: "100vh",

                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        // color: "white",
                        fontSize: "2rem",
                    }}
                >
                    {index === 0
                        ? <FirstPage />
                        : index === 1
                            ? <CreateGrid grid={grid} setGrid={setGrid} deskStyle={deskStyle}/>
                            : index === 2
                                ? <CreateGroup grid={grid} setGrid={setGrid} deskStyle={deskStyle}/>
                                // ? <div>test</div>
                                : section.title}

                </section>

            ))}
        </div>
    )
}