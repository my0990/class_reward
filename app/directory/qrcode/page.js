import QrcodeImg from '@/public/qrcode.png'
import Image from 'next/image'
export default function Qrcode() {
    return(
        <div className="w-lg flex flex-col justify-center items-center mt-5">
            <div className="text-[3rem]">학생가입 페이지로 연결됩니다</div>
            <div>
                <Image 
                    src={QrcodeImg }
                />
            </div>
        </div>
    )
}