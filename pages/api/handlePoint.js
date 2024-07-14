import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

export default async function handler(req, res) {


  if (req.method === 'POST') {

    const { targetStudent, isSend, point } = req.body;
    // const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    // const {id} = session.user;
    // // MongoDB 연결
    // let itemId = (new ObjectId()).toString();
    const db = (await connectDB).db('data');

    const idArray = targetStudent.map((a)=>a.userId)
    if(isSend){
      const response = await db.collection('user_data').updateMany( { userId: { $in: idArray } },{$inc: {money: parseInt(point)}})
    } else {
      const response = await db.collection('user_data').updateMany( { userId: { $in: idArray } },{$inc: {money: -parseInt(point)}})
    }




    res.status(201).json({ result: true, message: '로그인 성공' });
  }
}