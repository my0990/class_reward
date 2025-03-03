import { connectDB } from '@/app/lib/database'
import {getToken} from 'next-auth/jwt'

export default async function handler(req, res) {


  if (req.method === 'POST') {

    const { amount, type } = req.body;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;
    // const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    // const {id} = session.user;
    // // MongoDB 연결
    // let itemId = (new ObjectId()).toString();
    const db = (await connectDB).db('data');


    if (type === "up") {
      const response = await db.collection('thermometer').updateOne({ code: code}, { $inc: { adjustment: parseFloat(amount) } }, {upsert:true})
    } else {
        const response = await db.collection('thermometer').updateOne({ code: code}, { $inc: { adjustment: -parseFloat(amount) } },{upsert:true})
    }





    res.status(201).json({ result: true, message: '로그인 성공' });
  }
}