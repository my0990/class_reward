import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let { userId, role } = session.user;
    // const {nickname, state} = req.body;
    // MongoDB 연결
    const db = (await connectDB).db('data');
    const response = await db.collection('user_data').updateOne({userId:userId},{$set: {classData: req.body.data}},{upsert: true})
    const respojnse2 = await db.collection('user_data').updateMany({teacher:userId},{$set: {classData: req.body.data}},{upsert: true})

    // console.log(response2)
    res.status(201).json({ result: true, message: '화폐 입력 성공' });
  }
}