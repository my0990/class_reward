import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import TeacherProfileTemplate from "./teacher/TeacherProfileTemplate"
export default async function Layout({  }) {
  const session = await getServerSession(authOptions)
  // console.log("Student:", student);
  // console.log("Teacher:", teacher);

  if(!session){
    return(
      <div>loadding....</div>
    )
  }
  return (
    <>
      {/* {session?.role === "student" ? student : null}  학생 페이지 렌더링 */}
      {session?.role === "teacher" ? <TeacherProfileTemplate />: null}
    </>
  )
}