import { connectDB } from '@/app/lib/database'
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {


  if (req.method === 'POST') {
    // const {userId, point} = req.body;

    console.log(req.body)
    const db = (await connectDB).db('data');
    const questId = ObjectId.createFromHexString(req.body.questData._id)
    const userIds= req.body.rewarded.map(obj => obj.userId);
    console.log(userIds)
    const response = await db.collection('user_data').updateMany({ userId: { $in: userIds} },{$inc: {money: parseInt(req.body.questData.questReward)}})
    const response2 = await db.collection('quest').updateOne({_id: questId}, {$set: {finished: true}})


    res.status(201).json({ result: true, message: '로그인 성공'});
}}