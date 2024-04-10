import MarketTemplate from "./components/marketTemplate";
import { connectDB } from "@/app/lib/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export default async function Market(){
    const session = await getServerSession(authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId, role, teacher} = session.user;
    const db = (await connectDB).db('data')
    console.log(session)
    let response2 = await db.collection('student').findOne({userId: userId})

    if(role === 'student'){
        userId = teacher
    }

    let response = await db.collection('teacher').findOne({userId:userId})
    if(!response){
        response= {'itemList': []}
    }

    let data = response.itemList

    // data = data.map((a)=>{
    //   a.id = a.id.toString()
    //   return a})
    return(
        <div>
            <MarketTemplate data={data} role={role} money={response2?.money}/>
        </div>
    )
}