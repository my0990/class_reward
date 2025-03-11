import Header from "./components/header/header"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function RootLayout({ children }) {
    const session = await getServerSession(authOptions);
    console.log(session)
    // if (!session) {
    //     redirect("/");

    // } else {
        return (
            <div className="dark:text-black flex flex-col h-screen">
                <Header session={session} />
                {children}
                <SpeedInsights />
            </div>
        )
    // }
}