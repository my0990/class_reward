import HomePage from "./home/HomePage"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { connectDB } from '@/app/lib/database';
import { redirect } from "next/navigation";

export default async function Page() {
    const { user } = await getServerSession(authOptions)
    const { userId } = user
    const db = (await connectDB).db('data')
    const response = await db.collection('user_data').find({ teacher: userId }).sort({ userName: 1 }).toArray()
    if(!response){
        console.log('user denied')
    }
    const tmp = response.map((a) => { a._id = a._id.toString(); return a })
    return (
        <>
            <HomePage data={tmp} />
        </>
    )
}