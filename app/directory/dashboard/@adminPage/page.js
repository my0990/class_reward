// import { connectDB } from "@/app/lib/database";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"
// import { getServerSession } from "next-auth"
import ProfileRegisterTemplate from './component/ProfileRegisterTemplate';
import { connectDB } from '@/app/lib/database';
export default async function Page() {

    console.log('admin rendered')
    console.log('admin rendered')
    console.log('admin rendered')


    const db = (await connectDB).db('data')
    const response = await db.collection('common').find({}).toArray();
    return (
        <div className="flex justify-center py-[100px]">
            <ProfileRegisterTemplate urlObj={response[0].profileUrlObj}/>
        </div>

    )
}