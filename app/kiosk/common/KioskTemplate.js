'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mutate } from 'swr';




export default function Kiosk() {






    useEffect(() => {
        const preventGoBack = () => {
            history.pushState(null, '', location.href);
        };

        history.pushState(null, '', location.href);
        window.addEventListener('popstate', preventGoBack);

        return () => window.removeEventListener('popstate', preventGoBack);
    }, []);

    return (
        <div  >

            {/* {menu=== 'home'
                ? <KioskHomeTemplate enterFullscreen={enterFullscreen} />
                : menu === 'use'
                    ? <ItemUse />
                    : menu === "thermometer"
                        ? <Thermometer/>
                        : <ItemBuy />} */}
            <div className=" flex flex-col justify-center items-center h-[100vh] text-[1.5rem] bg-orange-100 relative overflow-hidden" >
                
                <div className="flex items-center mb-[24px]"><div className="rounded-full mr-[8px] text-white  bg-orange-500 w-[40px] h-[40px] flex justify-center items-center">뀰</div> kiosk</div>

                <Link href="/kiosk/buy"><button className="btn mb-[16px] px-[24px] border-4 hover:border-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white h-[40px] w-[200px]">아이템 구매하기</button></Link>
                <Link href="/kiosk/use"><button className="btn mb-[16px] px-[24px] border-4 hover:border-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white h-[40px] w-[200px]">아이템 사용하기</button></Link>
                <Link href="/kiosk/thermometer"><button className="btn px-[12px] border-4 hover:border-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white h-[40px] w-[200px]"><span className="text-[1.5rem]">🌡️</span> 학급 온도계</button></Link>


            </div>
        </div>
    );
};