import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let { userId, role, teacher } = session.user;
    // const {nickname, state} = req.body;
    // MongoDB 연결
    const db = (await connectDB).db('data');

    // const questId = ObjectId.createFromHexString(req.body._id);
    // const response2 = await db.collection('quest').findOne({'_id': questId})

    const response = await db.collection('thermometer').updateOne({userId: userId},{$set: {"reward":req.body.rewardObj, "requireCurrency": req.body.requireCurrency}},{upsert: true})

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
    console.log(req.body)

    // console.log(response2)
    res.status(201).json({ result: true, message: 'profile 변경 성공' });
  }
}