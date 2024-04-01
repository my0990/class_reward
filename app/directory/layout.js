import Header from "../components/common/header"
import { SessionProvider } from "next-auth/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
export default function RootLayout({children}){
    return(
        <div>
            <Header />
            {children}
            <SpeedInsights />
        </div>
    )
}