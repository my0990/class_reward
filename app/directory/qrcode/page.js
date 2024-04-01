import QrcodeImg from '@/public/qrcode.png'
import Image from 'next/image'
import CreateQr from './component/CreateQr';
import { connectDB } from '@/app/lib/database';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import QRCode from "react-qr-code";

export default async function Qrcode() {

    const db = (await connectDB).db('user');
    const session = await getServerSession(authOptions);
    const {id, name} = session.user;
    const response = await db.collection('users').findOne({id: id});


    return(
        <div className="w-lg flex flex-col justify-center items-center mt-5">
            {response.code ?<div>
                <div className="text-[3rem]">학생가입 페이지로 연결됩니다</div>
            <div>
                <QRCode value={`localhost:3000/qrcode/${id}/${response.code}`}/>
            </div>
            </div> 
            : <div>
                <CreateQr />
            </div>}
        </div>
    )
}