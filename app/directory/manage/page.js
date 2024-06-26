import ManageTemplate from "./components/ManageTemplate"
import { connectDB } from "@/app/lib/database"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export default async function StudentManage() {
    // let data = [
    //     { userName: '이명권', userId: 'mu0990' },
    //     { userName: '이재철', userId: 't0990' }
    // ]
    const db = (await connectDB).db('data')

    const session = await getServerSession(authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId, role, teacher} = session.user;
    if(role !== "teacher"){
        return (
            <div>
                잘못된 접근입니다.
            </div>
        )
    }
    const response = await db.collection('user_data').find({teacher:userId}).sort({userName: 1}).toArray();
    let data = response.map((a)=>{
        a._id = a._id.toString()
        return a
      })
    return (
        <div>
            <ManageTemplate data={data} teacher={userId}/>
        </div>
    )
}