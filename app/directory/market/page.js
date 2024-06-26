import MarketTemplate from "./components/marketTemplate";
import { connectDB } from "@/app/lib/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export default async function Market(){
    const session = await getServerSession(authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId, role, teacher} = session.user;
    const db = (await connectDB).db('data')
    let response = null;    
    let itemListInit = null
    if(role === 'student'){
        response = await db.collection('user_data').findOne({userId: userId})
        const response2 = await db.collection('user_data').findOne({userId:teacher})
        itemListInit = response2.itemList;

    } else {
        response = await db.collection('user_data').findOne({userId: userId})
        itemListInit = response.itemList
    }
    response._id = response._id.toString()
    return(
        <div>
            <MarketTemplate userData={response} itemListInit={itemListInit} role={role}/>
        </div>
    )
}