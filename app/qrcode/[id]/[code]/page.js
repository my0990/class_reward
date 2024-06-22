import StudentSignupTemplate from "./component/StudentSignupTemplate"
import { connectDB } from "@/app/lib/database"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
export default async function StudentSignup({params}) {
    const session = await getServerSession(authOptions);
    const {id, code} = params
    const db = (await connectDB).db('data')
    const response = await db.collection('user_data').findOne({userId: id})
    if(session){
        redirect("/directory/dashboard")
    }
    console.log(code, response.code)
    if(code === response.code){
        return(
            <StudentSignupTemplate id={id} code={code}/>
        )
    } else {
        return(
           <div>잘못된 접근입니다.</div> 
        )

}
}