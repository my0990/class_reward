import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const {userId} = session.user;
    // MongoDB 연결
    const db = (await connectDB).db('data');
    const response = await db.collection('user_data').updateOne(
      { userId : userId },
      { $set : { "notification": [] } }
  );
    res.status(201).json({ result: true, message: 'delete 성공' });
}}