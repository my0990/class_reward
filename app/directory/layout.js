import Header from "./common/header"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { connectDB } from "@/app/lib/database";

export default async function RootLayout({ children }) {
    const session = await getServerSession(authOptions);
    const role = session.user.role
    const db = (await connectDB).db('data');
    let notificationCount = 0
    let data = null
    if (role === "teacher") {
        const response = await db.collection('teacher').findOne({ userId: session.user.userId })
        notificationCount = response.notificationCount;
        data = response
    } else {
        const response = await db.collection('student').findOne({ userId: session.user.userId })
        data = response
    }

    return (
        <div className="dark:text-black">
            <Header session={session.user} notificationCount={notificationCount} data={data} />
            {children}
            <SpeedInsights />
        </div>
    )
}