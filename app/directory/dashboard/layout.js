import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
export default async function Layout({ student, teacher, adminPage }) {
    const {user}= await getServerSession(authOptions)

    return <>{user?.userId === 'admin' ? adminPage : user?.role === 'teacher' ? teacher : student}</>
    
  }