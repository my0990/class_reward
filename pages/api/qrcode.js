'use server'
import { connectDB } from '@/app/lib/database';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';


export default async function handler(req, res) {

  if (req.method === 'POST') {
    // MongoDB 연결
    const randomString = Math.random().toString(16).substr(2, 8);
    const db = (await connectDB).db('user');
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const {userName, userId} = session.user;
    const response = await db.collection('users').updateOne({ userId: userId},{$set: { code: randomString }});


    
    // // 기존의 가입된 아이디 체크하기



    if (!response) {
        res.status(422).json({ result: false, error: '실패' });
        return;
      }


    // 성공시 response

    res.status(201).redirect(302,'/');
    

}}