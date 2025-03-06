import { connectDB } from '@/app/lib/database'
import {getToken} from 'next-auth/jwt'

export default async function handler(req, res) {


  if (req.method === 'POST') {


    const db = (await connectDB).db('data');
    const {userId, profileTitle} = req.body
    const response = await db.collection('user_data').updateOne({userId: userId},{$set: {"profileTitle":profileTitle}})


    res.status(200).json({ result: true, message: 'profile 변경 성공' });
  }
}