import BrowseCard from "./components/BrowseCard"
import { connectDB } from "@/app/lib/database"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export default async function Browse() {
    const db = (await connectDB).db('data')
    const session = await getServerSession(authOptions); 
    console.log(session)
    const response = await db.collection('student').find({ teacher: session.user.teacher}).sort({userName: 1}).toArray()
    return (
        <div className="flex justify-center mt-[8px]">
            <div className="flex  flex-wrap  w-[1344px] max-[1344px]:w-[640px]">
                {response.map((a, i) => {
                    return (
                        <BrowseCard key={i} data={a} />
                    )
                })}
            </div>
        </div>
    )
}