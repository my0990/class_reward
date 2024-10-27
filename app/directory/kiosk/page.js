
import KioskTemplate from "./components/KioskTemplate"
import { connectDB } from "@/app/lib/database"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";



export default async function Kiosk(){
    const session = await getServerSession(authOptions);
    const {userId} = session.user;
    const db = (await connectDB).db('data')
    const response = await db.collection('thermometer').findOne({userId: userId})
    const response2 = await db.collection('user_data').find({teacher: userId}).sort({classNumber:'1'}).toArray()


    return(
        <div><KioskTemplate fetchedThermometerData={response} fetchedStudentData={response2}/></div> 
    )
}