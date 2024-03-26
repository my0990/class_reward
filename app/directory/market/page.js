import MarketTemplate from "./components/marketTemplate";
import { connectDB } from "@/app/lib/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export default async function Market(){
    const session = await getServerSession(authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {id, role, teacher} = session.user;
    const db = (await connectDB).db('data')
    if(role === 'student'){
        id = teacher
    }

    let response = await db.collection('teacher').findOne({user:id})
    if(!response){
        response= {'itemList': []}
    }

    let data = response.itemList

    // data = data.map((a)=>{
    //   a.id = a.id.toString()
    //   return a})
    return(
        <div>
            <MarketTemplate data={data} role={role}/>
        </div>
    )
}