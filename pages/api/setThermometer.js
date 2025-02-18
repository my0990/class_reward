import { connectDB } from '@/app/lib/database'
import {getToken} from 'next-auth/jwt'
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;
    // const {nickname, state} = req.body;
    // MongoDB 연결
    const db = (await connectDB).db('data');

    // const questId = ObjectId.createFromHexString(req.body._id);
    // const response2 = await db.collection('quest').findOne({'_id': questId})

    const response = await db.collection('thermometer').updateOne({code: code},{$set: {"reward":req.body.rewardObj, "requireCurrency": req.body.requireCurrency}},{upsert: true})

    // const response2 = await db.collection('quest').updateOne({ _id: questId}, [{
    //   $set: {
    //     "studentList.$[elem].done":  {$eq: [false,`$studentList.$[elem].done`]}
    //   }
    // }],
    // {arrayFilters:[{"elem.userId": req.body.userId}]})
    // const user = req.body.userId;
    // const response = await db.collection('quest').updateOne(
    //   { _id: questId, "studentList.userId": req.body.userId },
    //   {

    //     $bit: { "studentList.$.done": { xor: 1 } }

    //   }
    //   ,

    // )

    // console.log(response2)
    res.status(201).json({ result: true, message: 'profile 변경 성공' });
  }
}