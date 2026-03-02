import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import {getToken} from 'next-auth/jwt'
import { ObjectId } from 'mongodb';
import { buildFilter } from '@/lib/api/buildFilter';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const { questName, questGoal, questReward, questExp, questTitle } = req.body;
    console.log(req.body)
    const scopeFilter = await buildFilter(req, res, { classIdRequired: true });
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const { userId } = session;
    // MongoDB 연결

    const db = (await connectDB).db('data');

    const questId = new ObjectId();

    console.log(scopeFilter)
    const response = await db.collection('quest').insertOne({_id: questId, ...scopeFilter, questName: questName, questGoal: questGoal, questReward: questReward, questExp: questExp, questTitle: questTitle, finished: [],  time: new Date(), pending: [] }, { upsert: true })


    if(response){
      res.status(200).json({ result: true, message: 'quest 추가 성공',questId: questId.toString() });
    } else {
      res.status(402).json({result: false})
    }

  }
}