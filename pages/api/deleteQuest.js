import { connectDB } from '@/app/lib/database'
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    // MongoDB 연결
    console.log('req')
    console.log(req.body)
    let questId = ObjectId.createFromHexString(req.body.data._id)
    const db = (await connectDB).db('data');
    const response = await db.collection('quest').deleteOne(
      { _id : questId },
  );
    res.status(201).json({ result: true, message: 'delete 성공' });
}}