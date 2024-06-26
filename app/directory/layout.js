import Header from "./common/header"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { connectDB } from "@/app/lib/database";

export default async function RootLayout({ children }) {
    const session = await getServerSession(authOptions);
    const db = (await connectDB).db('data');
    const response = await db.collection('user_data').findOne({ userId: session.user.userId })
    response._id = response._id.toString();
    return (
        <div className="dark:text-black">
            <Header session={session.user} data={response} />
            {children}
            <SpeedInsights /> 
        </div>
    )
}