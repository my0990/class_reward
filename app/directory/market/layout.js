import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
export default async function Layout({ student, teacher }) {
    const {role}= await getServerSession(authOptions)
    return <>{role === 'teacher' ? teacher: student}</>
    
  }