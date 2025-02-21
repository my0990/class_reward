
import QuestDetailTemplate from "./components/QuestDetailTemplate";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"



export default async function QuestDetail({ params }) {
    const session = await getServerSession(authOptions)


    return (

        <QuestDetailTemplate role={session.role} params={params}/>

    )

}