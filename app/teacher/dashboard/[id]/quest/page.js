import QuestTemplate from "./components/QuestTemplate"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"

export default async function Quest({params}) {
    const {id} = await params
    const session = await getServerSession(authOptions)
    return (
        <QuestTemplate role={session.user.role} classId={id}/>
    )
}