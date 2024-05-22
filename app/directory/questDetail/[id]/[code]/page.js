import { connectDB } from "@/app/lib/database"
import QuestDetailTemplate from "./components/questDetailTemplate"
export default async function questDetail({params}){
    const {id, code} = params
    const db = (await connectDB).db('data')
    const response = await db.collection('quest').findOne({$and : [{userId: params.id},{id: params.code}]})
    const response2 = await db.collection('student').find({teacher: params.id}).toArray();

    return(
        <QuestDetailTemplate response={response} response2={response2}/>
    )
}