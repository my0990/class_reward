import { connectDB } from '@/app/lib/database'
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {


  if (req.method === 'POST') {
    // const {userId, point} = req.body;

    // console.log(req.body)
    const db = (await connectDB).db('data');
    const questId = ObjectId.createFromHexString(req.body.questData._id)
    const userIds= req.body.rewarded.map(obj => obj.userId);
    // console.log(req.body)

    const response = await db.collection('user_data').updateMany({ userId: { $in: userIds}, role: 'student'},{$inc: {money: parseInt(req.body.questData.questReward)}})
    const response2 = await db.collection('quest').updateOne({_id: questId}, {$addToSet: { finished: { $each: userIds } } })
  

    const historyArray = req.body.rewarded.map((a) => ({ userId: a.userId, balance: parseInt(a.money) + parseInt(req.body.questData.questReward), type: 'deposit', amount: parseInt(req.body.questData.questReward), date: new Date(), name: '퀘스트 완료', expiresAfter: new Date() }))
    const response4 = await db.collection('history').insertMany(historyArray)

    res.status(201).json({ result: true, message: '로그인 성공'});
}}