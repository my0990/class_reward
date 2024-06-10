import HomePage from "./home/HomePage"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { connectDB } from '@/app/lib/database';
import { redirect } from "next/navigation";

export default async function Page(){
    const {user}= await getServerSession(authOptions)
    const {userId} = user
    const db = (await connectDB).db('data')
    const response = await db.collection('student').find({teacher: userId}).sort({userName:1}).toArray()
    const response2 = await db.collection('teacher').find({userId: userId}).toArray();
    const tmp = response.map((a,i)=> {a._id = a._id.toString(); return a})
    const tmp2 = response2.map((a,i)=> {a._id = a._id.toString(); return a})
    // if(response2.currencySetting === undefined){
    //     redirect("/guide")
    // }
    return(
        <>
        <HomePage data={tmp} data2={tmp2}/>

        </>
    )
}