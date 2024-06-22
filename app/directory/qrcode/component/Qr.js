'use client'

import Image from 'next/image'
import QRCode from "react-qr-code";
// import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
export default function Qr({id, code}) {
    const pathname = usePathname();
    return (
        <div className="flex justify-center items-center flex-col w-[400px] h-[400px] bg-gray-300 rounded-3xl bg-orange-200 mt-[80px]">
            <div className="bg-white w-[272px] h-[272px] rounded-3xl flex justify-center items-center">
                <QRCode value={`https://class-reward.vercel.app/qrcode/${id}/${code}`} style={{ height: "auto", maxWidth: "100%", width: "65%" }} />
            </div>
        </div>
    )
}