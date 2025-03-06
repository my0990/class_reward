import { connectDB } from '@/app/lib/database'
import {getToken} from 'next-auth/jwt'
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;

    const db = (await connectDB).db('data');
    const response = await db.collection('thermometer').updateOne({code: code},{$set: {"reward":req.body.rewardObj, "requireCurrency": req.body.requireCurrency}},{upsert: true})


    res.status(200).json({ result: true, message: 'profile 변경 성공' });
  }
}