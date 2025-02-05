import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import {getToken} from 'next-auth/jwt'
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let { userId, role } = session;
    const {currencyName, currencyEmoji} = req.body.data
    console.log(req.body.data)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;
    // const {nickname, state} = req.body;
    // MongoDB 연결
    const db = (await connectDB).db('data');
    const response = await db.collection('class_data').updateOne({code:code},{$set: {currencyName: currencyName, currencyEmoji: currencyEmoji}},{upsert: true})
    // const respojnse2 = await db.collection('user_data').updateMany({teacher:userId},{$set: {classData: req.body.data}},{upsert: false})

    // console.log(response2)
    res.status(201).json({ result: true, message: '화폐 입력 성공' });
  }
}