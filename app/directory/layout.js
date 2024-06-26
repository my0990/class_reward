import Header from "./common/header"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { connectDB } from "@/app/lib/database";
import { signOut } from "next-auth/react"
export default async function RootLayout({ children }) {
    const session = await getServerSession(authOptions);
    const db = (await connectDB).db('data');
    const response = await db.collection('user_data').findOne({ userId: session.user.userId })
    if(!response){
        console.log('user denied')
        signOut();
    }
    response._id = response._id.toString();
    return (
        <div className="dark:text-black">
            <Header session={session.user} data={response} />
            {children}
            <SpeedInsights /> 
        </div>
    )
}