import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';


export default async function handler(req, res) {


  if (req.method === 'POST') {
    const db = (await connectDB).db('user');
    const checkExisting = await db.collection('users').findOne({ userId: req.body.userId });

    if (checkExisting) {
      res.status(422).json({ result: false, error: '이미 가입된 계정이에요!' });
      return;
    }


    res.status(201).json({ result: true, message: 'delete 성공'});
  }
}



