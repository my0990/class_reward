// 'use client'
// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import { mutate } from 'swr';




// export default function Kiosk({classId}) {






//     useEffect(() => {
//         const preventGoBack = () => {
//             history.pushState(null, '', location.href);
//         };

//         history.pushState(null, '', location.href);
//         window.addEventListener('popstate', preventGoBack);

//         return () => window.removeEventListener('popstate', preventGoBack);
//     }, []);

//     return (
//         <div  >
//             <div className=" flex flex-col justify-center items-center h-[100vh] text-[1.5rem] bg-orange-100 relative overflow-hidden" >

//                 <div className="flex items-center mb-[24px]"><div className="rounded-full mr-[8px] text-white  bg-orange-500 w-[40px] h-[40px] flex justify-center items-center">뀰</div> kiosk</div>

//                 <Link href={`/teacher/kiosk/${classId}/buy`}><button className="btn mb-[16px] px-[24px] border-4 hover:border-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white h-[40px] w-[200px]">아이템 구매하기</button></Link>
//                 <Link href={`/teacher/kiosk/${classId}/use`}><button className="btn mb-[16px] px-[24px] border-4 hover:border-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white h-[40px] w-[200px]">아이템 사용하기</button></Link>
//                 <Link href={`/teacher/kiosk/${classId}/thermometer`}><button className="btn px-[12px] border-4 hover:border-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white h-[40px] w-[200px]"><span className="text-[1.5rem]">🌡️</span> 학급 온도계</button></Link>


//             </div>
//         </div>
//     );
// };

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Kiosk({ classId }) {
    const [time, setTime] = useState('')

    useEffect(() => {
        const preventGoBack = () => {
            history.pushState(null, '', location.href)
        }

        history.pushState(null, '', location.href)
        window.addEventListener('popstate', preventGoBack)

        return () => window.removeEventListener('popstate', preventGoBack)
    }, [])

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setTime(
                now.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                })
            )
        }

        updateTime()
        const timer = setInterval(updateTime, 1000)

        return () => clearInterval(timer)
    }, [])

    const menus = [
        {
            href: `/teacher/kiosk/${classId}/buy`,
            icon: '🛒',
            title: '아이템 구매하기',
            desc: '아이템을 구매해요',
        },
        {
            href: `/teacher/kiosk/${classId}/use`,
            icon: '🎒',
            title: '아이템 사용하기',
            desc: '가지고 있는 아이템을 사용해요',
        },
        {
            href: `/teacher/kiosk/${classId}/thermometer`,
            icon: '🌡️',
            title: '학급 온도계',
            desc: '우리 반 기부 현황을 확인해요',
        },
    ]

    return (
        <main className="fixed inset-0 overflow-hidden bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-orange-300/40 blur-2xl" />
            <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-yellow-300/50 blur-2xl" />
            <div className="absolute left-[50%] top-[50%] h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-3xl" />

            <section className="relative z-10 flex h-full w-full flex-col items-center justify-between px-5 py-5 sm:px-8 sm:py-6 landscape:py-5">
                <header className="flex w-full max-w-[1100px] items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black text-white shadow-lg sm:h-14 sm:w-14 sm:text-2xl">
                            뀰
                        </div>

                        <div>
                            <div className="text-xl font-black text-orange-900 sm:text-2xl">
                                CLASS KIOSK
                            </div>
                            <div className="text-sm font-bold text-orange-600 sm:text-base">
                                학생용 키오스크
                            </div>
                        </div>
                    </div>

                    <div className="rounded-full bg-white/80 px-4 py-2 text-base font-black text-orange-700 shadow-md sm:px-5 sm:text-xl">
                        {time}
                    </div>
                </header>


                <div className="grid w-full max-w-[1100px] grid-cols-1 gap-4 sm:gap-5 landscape:grid-cols-3">
                    {menus.map((menu) => (
                        <Link key={menu.href} href={menu.href} className="block">
                            <button className="group flex h-[150px] w-full flex-col items-center justify-center rounded-[28px] border-4 border-orange-300 bg-white/95 p-4 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-orange-500 hover:bg-orange-500 active:scale-95 sm:h-[190px] sm:rounded-[36px] landscape:h-[230px]">
                                <div className="mb-2 text-5xl transition-transform duration-200 group-hover:scale-110 sm:text-6xl landscape:text-7xl">
                                    {menu.icon}
                                </div>

                                <div className="text-xl font-black text-orange-950 group-hover:text-white sm:text-2xl landscape:text-3xl">
                                    {menu.title}
                                </div>

                                <div className="mt-2 text-center text-sm font-bold text-orange-500 group-hover:text-orange-100 sm:text-base landscape:text-lg">
                                    {menu.desc}
                                </div>
                            </button>
                        </Link>
                    ))}
                </div>

                <footer className="rounded-full  px-5 py-2 text-sm font-bold text-orange-600 ">
                     
                </footer>
            </section>
        </main>
    )
}