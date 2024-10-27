import ThermometerObject from "@/app/components/thermometer/ThermometerObject"
import Donation from "@/app/components/thermometer/donation/Donation"
import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import ModalFirst from "../../components/thermometer/ModalFirst"
import ClickComponent from "../../components/thermometer/ClickComponent";
import ThermometerTemplate from "./components/ThermometerTemplate";

export default async function Thermometer() {
    const session = await getServerSession(authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let { userId, role, teacher } = session.user;
    if (role === 'student') {
        userId = teacher
    } else {
        teacher = userId
    }
    // MongoDB 연결

    const db = (await connectDB).db('data');
    const thermoInfo= await db.collection('thermometer').findOne({ userId: userId })
    const studentInfo= await db.collection('user_data').find({teacher: teacher}).toArray();

    if (thermoInfo === null) {
        return (
            <div className="flex justify-center items-center flex-col">
                <div>
                    {role === 'teacher' 
                        ? <ClickComponent /> 
                        : <div className="text-[1.5rem] mt-[32px]">학급 온도계가 활성화 되어있지 않습니다<br></br></div>}
                </div>
                <ModalFirst />
            </div>
        )
    }
    return (
        <ThermometerTemplate role={role} studentInfo={studentInfo} thermoInfo={thermoInfo}/>
    )
}