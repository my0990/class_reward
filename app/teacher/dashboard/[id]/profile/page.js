import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import TeacherProfileTemplate from "./teacher/TeacherProfileTemplate"
import { redirect } from "next/navigation";
// import StudentProfileTemplate from "../../../../student/dashboard/[id]/profile/student/StudentProfileTemplate"
export default async function Layout({ params }) {
  const session = await getServerSession(authOptions)
  const { id } = await params;

if(session.user.role === "student"){
  redirect('/')
}

  return (
    <>
      <TeacherProfileTemplate classId={id} />
    </>
  )
}
