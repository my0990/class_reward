import Header from "../components/common/header"
import { SessionProvider } from "next-auth/react"

export default function RootLayout({children}){
    return(
        <div>
            <Header />
            {children}
        </div>
    )
}