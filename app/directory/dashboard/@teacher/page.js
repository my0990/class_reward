import HomePage from "./home/HomePage"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { connectDB } from '@/app/lib/database';
export default async function Page(){
    const {user}= await getServerSession(authOptions)
    const {userId} = user
    const db = (await connectDB).db('data')
    const response = await db.collection('student').find({teacher: userId}).toArray()
    const tmp = response.map((a,i)=> {a._id = a._id.toString(); return a})
    return(
        <HomePage data={tmp}/>
    )
}