import StudentSignupTemplate from "./component/StudentSignupTemplate"
import { connectDB } from "@/app/lib/database"
export default async function StudentSignup({params}) {
    const {id, code} = params
    const db = (await connectDB).db('user')
    const response = await db.collection('users').findOne({userId: id})
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