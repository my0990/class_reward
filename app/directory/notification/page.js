import NotificationTemplate from './components/notificationTemplate';
import { connectDB } from "@/app/lib/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
export default async function Notification(){
    // let data = [{ name: '자리바꾸기', price: 50001 }, { name: '급식 1등으로 가기', price: 300 }, { name: '사탕 1개', price: 30 }]
    const session = await getServerSession(authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId, role, teacher} = session.user;
    const db = (await connectDB).db('data')
    const data = await db.collection('user_data').findOne({userId: userId})

    return(
        <NotificationTemplate data={data?.notification} userId={userId}/>
    )
}