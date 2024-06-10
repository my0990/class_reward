import QrcodeImg from '@/public/qrcode.png'
import Image from 'next/image'
import CreateQr from './component/CreateQr';
import { connectDB } from '@/app/lib/database';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import QRCode from "react-qr-code";
import Qr from './component/Qr';
export default async function Qrcode() {

    const db = (await connectDB).db('user');
    const session = await getServerSession(authOptions);
    const { userId, userName } = session.user;
    const response = await db.collection('users').findOne({ userId: userId });


    return (
        <div className="w-lg flex flex-col justify-center items-center mt-5">
            {response?.code ?
                <div className="flex flex-wrap justify-evenly w-full">
                    <div className="flex flex-col items-center">
                        <Qr id={userId} code={response.code} isLogin={false} />
                        <div className="mt-[56px] text-[2rem] dark:text-white">학생 회원가입 페이지로 이동합니다</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <Qr id={userId} code={response.code} isLogin={true} />
                        <div className="mt-[56px] text-[2rem] dark:text-white">로그인 페이지로 이동합니다</div>
                    </div>
                </div>
                :
                <CreateQr />

            }
        </div>
    )
}