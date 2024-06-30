import KioskTemplate from "./components/KioskTemplate"
import { connectDB } from "@/app/lib/database"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

export default async function Kiosk(){
    const session = await getServerSession(authOptions);
    const {userId} = session.user;
    const db = (await connectDB).db('data')
    const response = await db.collection('user_data').findOne({userId: userId})
    const response2 = await db.collection('user_data').find({teacher: userId}).toArray()
    const tmp = response2.map((a) => { a._id = a._id.toString(); return a })
    response._id = response._id.toString();
    return(
        <div><KioskTemplate itemData={response} studentData={tmp}/></div>
    )
}