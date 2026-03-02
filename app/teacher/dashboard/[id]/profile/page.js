import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import TeacherProfileTemplate from "./teacher/TeacherProfileTemplate"
import StudentProfileTemplate from "./student/StudentProfileTemplate"
export default async function Layout({params }) {
  const session = await getServerSession(authOptions)
  const { id } = await params;

  if (!session) {
    return (
      <div>loadding....</div>
    ) 
  } else {


    return (
      <>
        {/* {session?.role === "student" ? student : null}  학생 페이지 렌더링 */}
        {session?.user?.role === "teacher" ? <TeacherProfileTemplate classId={id}/> : <StudentProfileTemplate />}
      </>
    )
  }
}