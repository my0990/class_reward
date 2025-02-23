'use client'
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';



//atom({key:, default:})로 새로운 아톰을 만들 수 있다.
// 이때 key는 각 아톰을 구별하는 고유한 식별자이다.
// default는 initial state를 의미한다.


export default function Kiosk() {


    const elementRef = useRef(null);


    const enterFullscreen = () => {
        if (elementRef.current.requestFullscreen) {
            elementRef.current.requestFullscreen();
        } else if (elementRef.current.mozRequestFullScreen) { /* Firefox */
            elementRef.current.mozRequestFullScreen();
        } else if (elementRef.current.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            elementRef.current.webkitRequestFullscreen();
        } else if (elementRef.current.msRequestFullscreen) { /* IE/Edge */
            elementRef.current.msRequestFullscreen();
        }
    };
    useEffect(() => {
        const preventGoBack = () => {
            history.pushState(null, '', location.href);
        };

        history.pushState(null, '', location.href);
        window.addEventListener('popstate', preventGoBack);

        return () => window.removeEventListener('popstate', preventGoBack);
    }, []);

    return (
        <div ref={elementRef} >

            {/* {menu=== 'home'
                ? <KioskHomeTemplate enterFullscreen={enterFullscreen} />
                : menu === 'use'
                    ? <ItemUse />
                    : menu === "thermometer"
                        ? <Thermometer/>
                        : <ItemBuy />} */}
            <div className="flex flex-col justify-center items-center h-[100vh] text-[1.5rem] bg-orange-100 relative overflow-hidden" >
                <div className="flex items-center mb-[24px]"><div className="rounded-full mr-[8px] text-white  bg-orange-500 w-[40px] h-[40px] flex justify-center items-center">뀰</div> kiosk</div>
                <Link href="/kiosk/buy"><button className="btn mb-[16px] px-[24px] w-[140px]">아이템 구매하기</button></Link>
                <button className="btn mb-[16px] px-[24px] w-[140px]">아이템 사용하기</button>
                <button className="btn px-[12px] w-[140px]"><span className="text-[1.5rem]">🌡️</span> 학급 온도계</button>

                <button onClick={enterFullscreen} className="btn px-[24px] absolute top-0 right-0 opacity-50 hover:opacity-100" >전체 <br></br>화면</button>
            </div>
        </div>
    );
};