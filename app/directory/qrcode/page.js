import CreateQr from './component/CreateQr';
import { connectDB } from '@/app/lib/database';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import Qr from './component/Qr';
export default async function Qrcode() {

    const db = (await connectDB).db('data');
    const session = await getServerSession(authOptions);
    const { userId } = session.user;
    const response = await db.collection('user_data').findOne({ userId: userId });


    return (
        <div className="w-lg flex flex-col justify-center items-center mt-5">
            {response?.code ?
                <div className="flex flex-wrap justify-evenly w-full">
                    <div className="flex flex-col items-center">
                        <Qr id={userId} code={response.code} isLogin={false} />
                        <div className="mt-[56px] text-[2rem] dark:text-white">학생 회원가입 페이지로 이동합니다</div>
                    </div>
                </div>
                :
                <CreateQr />

            }
        </div>
    )
}