import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

export default async function handler(req, res) {


  if (req.method === 'POST') {

    const { userId, amount, type } = req.body;
    // const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    // const {id} = session.user;
    // // MongoDB 연결
    // let itemId = (new ObjectId()).toString();
    const db = (await connectDB).db('data');


    if (type === "up") {
      const response = await db.collection('thermometer').updateOne({ userId: userId }, { $inc: { adjustment: parseFloat(amount) } }, {upsert:true})
    } else {
        const response = await db.collection('thermometer').updateOne({ userId: userId }, { $inc: { adjustment: -parseFloat(amount) } },{upsert:true})
    }





    res.status(201).json({ result: true, message: '로그인 성공' });
  }
}