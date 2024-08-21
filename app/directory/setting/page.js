import SettingTemplate from "./components/SettingTemplate"
import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

export default async function Setting(){
    const session = await getServerSession(authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId,role,teacher} = session.user;

    // MongoDB 연결

    const db = (await connectDB).db('data');
    const response = await db.collection('user_data').findOne({userId:userId})
    const {profileNickname, profileState, gender, profileUrl} = response;

    return(
        <div>
            <SettingTemplate profileUrl={profileUrl} profileNickname={profileNickname} profileState={profileState} gender={gender}/>
        </div>
    )
}