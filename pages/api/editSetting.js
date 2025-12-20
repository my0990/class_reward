import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import {getToken} from 'next-auth/jwt'
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const { groupKey, setting } = req.body;

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;

    // MongoDB 연결

    

    const db = (await connectDB).db('data');

    console.log(setting)
    const response = await db.collection('class_data').updateOne({ code: code},{$set: { setting: setting} }, { upsert: true })


    if(response){
      res.status(200).json({ result: true, message: 'groupName 변경 성공' });
    } else {
      res.status(402).json({result: false})
    }

  }
}