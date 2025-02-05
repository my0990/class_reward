import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import {getToken} from "next-auth/jwt"


export default async function handler(req, res) {

  const session = await getServerSession(req,res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
  const {userId} = session;
  if (req.method === 'POST') {
    const db = (await connectDB).db('data');
    const checkExisting = await db.collection('class_data').findOne({ uniqueNickname: req.body.uniqueNickname });

    if (checkExisting) {
      res.status(422).json({ result: false, error: '이미 가입된 계정이에요!' });
      return;
    } else {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      const code = token.code;
      const response = await db.collection('class_data').updateOne({code: code},{$set: {uniqueNickname: req.body.uniqueNickname}})
    }


    res.status(201).json({ result: true, message: 'delete 성공'});
  }
}



