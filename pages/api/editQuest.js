import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import {getToken} from 'next-auth/jwt'
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    console.log(req.body)
    const { name, goal, reward, exp, title, questId } = req.body;
    console.log(questId)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;

    // MongoDB 연결
    let convertedQuestId = ObjectId.createFromHexString(questId);
    
    console.log(convertedQuestId)
    const db = (await connectDB).db('data');
    const response = await db.collection('quest').updateOne({ code: code, _id: convertedQuestId},{$set: { questName: name, questGoal: goal, questReward: reward, questExp: exp, questTitle: title, time: new Date()} }, { upsert: true })


    if(response){
      res.status(200).json({ result: true, message: 'quest 추가 성공' });
    } else {
      res.status(402).json({result: false})
    }

  }
}