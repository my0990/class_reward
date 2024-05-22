import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {


  if (req.method === 'POST') {
    const { name, content, reward } = req.body;

    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const { userId } = session.user;
    // MongoDB 연결
    let questId = (new ObjectId()).toString();
    const db = (await connectDB).db('data');

    // const tmp = await db.collection('teacher').find({userId:userId})
    // tmp = tmp.studentNumber
    const response2 = await db.collection('student').find({ teacher: userId }).toArray();
    let studentList = response2.map((a, i) => {
      return { userId: a.userId, userName: a.userName, done: false }
    })  

    let tmp = {}
    studentList.forEach(key => {
      tmp[key.userName] = false
    });
    const response = await db.collection('quest').insertOne({ userId: userId, questName: name, questContent: content, questReward: reward, done: tmp, time: new Date(), doneCount: 0, id: questId }, { upsert: true })

    console.log('------')
    console.log('------')
    console.log('------')
    console.log(studentList)


    res.status(201).json({ result: true, message: 'quest 추가 성공' });
  }
}