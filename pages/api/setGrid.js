import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import {getToken} from 'next-auth/jwt'
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const { updatedGrid } = req.body;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;
    const db = (await connectDB).db('data');

    const response = await db.collection('class_data').updateOne({code: code},{$set: {gridData: updatedGrid}},{upsert: true})
    if(response){
      res.status(200).json({ result: true, message: 'grid set success' });
    } else {
      res.status(402).json({result: false})
    }

  }
}