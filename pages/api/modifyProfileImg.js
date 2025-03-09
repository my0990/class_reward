import { connectDB } from '@/app/lib/database'
import {getToken} from 'next-auth/jwt'

export default async function handler(req, res) {


  if (req.method === 'POST') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;
    const modifyKey = "profileImgStorage." + req.body.modalData.urlId
    // const {nickname, state} = req.body;
    // MongoDB 연결
    const db = (await connectDB).db('data');

    const updatedData = { price: req.body.price, url: req.body.modalData.url}
    const response = await db.collection('class_data').updateOne({code: code},{$set: {[modifyKey]: updatedData}},{upsert: true})

    res.status(200).json({ result: true, message: '화폐 입력 성공' });
  }
}