import QuestTemplate from "./components/QuestTemplate";
import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
export default async function Quest(){

    const session = await getServerSession(authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const {userId} = session.user;
    // MongoDB 연결

    const db = (await connectDB).db('data');

    // const tmp = await db.collection('teacher').find({userId:userId})
    // tmp = tmp.studentNumber
    const response = await db.collection('quest').find({userId:userId}).toArray();
    const response2 = await db.collection('teacher').find({userId:userId}).toArray();
    const data = response; 
    const studentNumber = response2[0].studentNumber;

    return(
        <QuestTemplate data={data} studentNumber={studentNumber} userId={userId}/>
    )
}