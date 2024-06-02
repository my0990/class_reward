import { connectDB } from '@/app/lib/database'
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {


  if (req.method === 'POST') {
    // const {userId, point} = req.body;

    console.log(req.body)
    const db = (await connectDB).db('data');
    const questId = ObjectId.createFromHexString(req.body.data._id)

    const response = await db.collection('student').updateMany({ userName: { $in: req.body.rewarded} },{$inc: {money: parseInt(req.body.data.questReward)}})
    const response2 = await db.collection('quest').updateOne({_id: questId}, {$set: {finished: true}})


    res.status(201).json({ result: true, message: '로그인 성공'});
}}