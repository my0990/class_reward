import { connectDB } from '@/app/lib/database'
import {getToken} from 'next-auth/jwt'
import { ObjectId } from 'mongodb'
export default async function handler(req, res) {


  if (req.method === 'POST') {
    // MongoDB 연결
    const deleteId = req.body.itemId;

    const db = (await connectDB).db('data');
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;
    const response = await db.collection('class_data').updateOne(
      { code : code },
      { $pull : { "itemList": { "itemId": deleteId} } }
  );
    res.status(200).json({ result: true, message: 'delete 성공' });
}}