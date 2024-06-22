import MarketTemplate from "./components/marketTemplate";
import { connectDB } from "@/app/lib/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export default async function Market(){
    const session = await getServerSession(authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId, role, teacher} = session.user;
    const db = (await connectDB).db('data')
    let response = null;
    let itemList = null;
    if(role === 'student'){
        itemList = await db.collection('user_data').findOne({userId:teacher})
        response = await db.collection('user_data').findOne({userId: userId})
    } else {
        response = await db.collection('user_data').findOne({userId: userId})
    }





    // data = data.map((a)=>{
    //   a.id = a.id.toString()
    //   return a})
    return(
        <div>
            <MarketTemplate data={response} role={role}/>
        </div>
    )
}