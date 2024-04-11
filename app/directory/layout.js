import Header from "./common/header"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { connectDB } from "@/app/lib/database";

export default async function RootLayout({children}){
    const session = await getServerSession(authOptions);
    const role = session.user.role
    const db = (await connectDB).db('data');
    let notificationCount = 0
    let money = 0
    if (role === "teacher") {
        const response = await db.collection('teacher').findOne({ user: session.user.id })
        notificationCount = response.notificationCount;
    } else {
        const response = await db.collection('student').findOne({user: session.user.Id})
        money = response.money
    }

    
    return(
        <div>
            <Header session={session.user} notificationCount={notificationCount} money={money}/>
            {children}
            <SpeedInsights />
        </div>
    )
}