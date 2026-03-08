
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import ThermometerTemplate from "./components/ThermometerTemplate";

export default async function Thermometer() {
    const session = await getServerSession(authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {  role, } = session;

    // MongoDB 연결  

    return (
        <ThermometerTemplate role={role}/>
    )
}