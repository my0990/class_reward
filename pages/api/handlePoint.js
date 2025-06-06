import { connectDB } from '@/app/lib/database'
import {getToken} from 'next-auth/jwt'

export default async function handler(req, res) {


  if (req.method === 'POST') {

    const { targetStudent, isSend, point } = req.body;
    // const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    // const {id} = session.user;
    // // MongoDB 연결
    // let itemId = (new ObjectId()).toString();
    const db = (await connectDB).db('data');
    const idArray = targetStudent.map((a) => a.userId)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;

    if (isSend) {
      const response = await db.collection('user_data').updateMany({ userId: { $in: idArray }, role: 'student' }, { $inc: { money: parseInt(point) } })
      const historyArray = targetStudent.map((a) => ({ code: code, userId: a.userId, balance: parseInt(a.money) + parseInt(point), type: 'deposit', amount: point, date: new Date(), name: '선생님으로부터 받음', expiresAfter: new Date() }))
      const response2 = await db.collection('history').insertMany(historyArray)
    } else {
      const response = await db.collection('user_data').updateMany({ userId: { $in: idArray }, role: 'student' }, { $inc: { money: -parseInt(point) } })
      const historyArray = targetStudent.map((a) => ({ code: code, userId: a.userId, balance: parseInt(a.money) - parseInt(point), type: 'withDrawal', amount: point, date: new Date(), name: '선생님으로부터 받음', expiresAfter: new Date() }))
      const response2 = await db.collection('history').insertMany(historyArray)
    }




    res.status(200).json({ result: true, message: '로그인 성공' });
  }
}