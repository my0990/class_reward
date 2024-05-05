import ManageTemplate from "./components/ManageTemplate"
import { connectDB } from "@/app/lib/database"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export default async function StudentManage() {
    // let data = [
    //     { userName: '이명권', userId: 'mu0990' },
    //     { userName: '이재철', userId: 't0990' }
    // ]
    const db = (await connectDB).db('user')

    const session = await getServerSession(authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId, role, teacher} = session.user;
    if(role !== "teacher"){
        return (
            <div>
                잘못된 접근입니다.
            </div>
        )
    }
    const response = await db.collection('users').find({teacher:userId}).toArray();
    return (
        <div>
            <ManageTemplate data={response} teacher={userId}/>
        </div>
    )
}