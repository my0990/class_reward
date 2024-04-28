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
                <>
                    {/* <div className="flex justify-center items-center flex-col w-[400px] h-[400px] bg-gray-300 rounded-full bg-orange-200 mt-[80px]">
                        <div className="bg-white w-[272px] h-[272px] rounded-3xl flex justify-center items-center">
                            <QRCode value={`localhost:3000/qrcode/${id}/${response.code}`} style={{ height: "auto", maxWidth: "100%", width: "65%" }} />
                        </div>
                    </div> */}
                    <Qr id={userId} code={response.code}/>
                    <div className="mt-[56px] text-[2rem] dark:text-white">학생 회원가입 페이지로 이동합니다</div>
                </>
                :
                <CreateQr />
            }
        </div>
    )
}