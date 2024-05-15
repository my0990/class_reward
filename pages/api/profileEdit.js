import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId,role,teacher} = session.user;
    const {nickname, state} = req.body;
    // MongoDB 연결

    const db = (await connectDB).db('data');

    const response = await db.collection(role).updateOne({userId: userId},{$set : {profileNickname: nickname, profileState: state}},{upsert:true})

    res.status(201).json({ result: true, message: 'profile 변경 성공' });
}}