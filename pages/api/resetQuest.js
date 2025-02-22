import { connectDB } from '@/app/lib/database'
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {


  if (req.method === 'POST') {
    // const {userId, point} = req.body;

    // console.log(req.body)
    const db = (await connectDB).db('data');
    const questId = ObjectId.createFromHexString(req.body.questData._id)
    // console.log(req.body)

  
    const response2 = await db.collection('quest').updateOne({_id: questId}, {$set: {finished: []}})
  


    res.status(200).json({ result: true, message: '로그인 성공'});
}}