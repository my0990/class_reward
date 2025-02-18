import { connectDB } from "@/app/lib/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import MarketTemplate from "../components/marketTemplate"
export default async function Market() {
    const { userId, teacher } = await getServerSession(authOptions)
    const db = (await connectDB).db('data')
    const response = await db.collection('user_data').findOne({ userId: teacher })

    if (response === null) {
        return
    }
    return (
        <MarketTemplate tmpItemList={response.itemList}/>
    )
}