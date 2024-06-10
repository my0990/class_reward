
import { connectDB } from '@/app/lib/database';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
export default async function Guide() {
    const session = await getServerSession(authOptions);
    const db = (await connectDB).db('data')
    const response = await db.collection("teacher").findOne({userId: session.user.userId});

    if(response.currencySetting === undefined){
        redirect("/guide")
    } else {
        redirect("/directory/dashboard")
    }
    return(
        <div>loading..</div>
    )
}