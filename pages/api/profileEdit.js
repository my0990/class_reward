import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId,role} = session;
    console.log(req.body);
    const {profileNickname, profileState} = req.body;

    // MongoDB 연결

    const db = (await connectDB).db('data');

    const response = await db.collection("user_data").updateOne({userId: userId, role: role},{$set : {profileNickname: profileNickname, profileState: profileState}},{upsert:true})

    res.status(200).json({ result: true, message: 'profile 변경 성공' });
}}