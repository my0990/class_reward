import AuthPage from "@/app/auth/login/components/AuthPage";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
export default async function TeacherLogin(){
    const session = await getServerSession(authOptions);

    if (session) {
  
      redirect("/directory/dashboard")
    }
    return(
        <AuthPage role="teacher"/>
    )
}