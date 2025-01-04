
import ProfileTemplate from "./component/ProfileTemplate";
import { connectDB } from "@/app/lib/database";
export default async function Page() {
    const db = (await connectDB).db('data');
    const response = await db.collection('common').find({}).toArray();

    return (
        <ProfileTemplate urlObj={response[0].profileUrlObj}/>
    )
}