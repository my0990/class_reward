import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
export default async function Layout({ student, teacher, adminPage }) {
    const session = await getServerSession(authOptions)

    return <>{session?.userId === 'admin' ? adminPage : session?.role === 'teacher' ? teacher : student}</>
    
  }