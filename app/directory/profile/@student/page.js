import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { connectDB } from "@/app/lib/database";
import StudentProfileTemplate from "./component/StudentProfileTemplate";
export default async function Page(){

    const {user}= await getServerSession(authOptions)
    const db = (await connectDB).db('data');
    const {teacher, userId} = user
    const response = await db.collection('user_data').find({userId:teacher}).toArray();

    const {profileUrlObj} = response[0]
    
    const filteredUrl = Object.keys(profileUrlObj).filter((data) => profileUrlObj[data].isActive === true)
    const filteredUrlArr = filteredUrl.map((a,i)=> profileUrlObj[a])
    for (const key in profileUrlObj) {
        if (typeof profileUrlObj[key] === "object" && profileUrlObj[key] !== null && profileUrlObj[key].isActive === false) {
            delete profileUrlObj[key];
        }
    }

    return(
        <StudentProfileTemplate data={profileUrlObj}/>
    )
}