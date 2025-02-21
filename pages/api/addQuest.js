import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import {getToken} from 'next-auth/jwt'

export default async function handler(req, res) {


  if (req.method === 'POST') {
    const { name, goal, reward, exp, title } = req.body;

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;

    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const { userId } = session;
    // MongoDB 연결
    // let questId = (new ObjectId()).toString();
    const db = (await connectDB).db('data');

    // const tmp = await db.collection('teacher').find({userId:userId})
    // tmp = tmp.studentNumber
    // const response2 = await db.collection('user_data').find({ teacher: userId }).sort({classNumber:1}).toArray();
    // let studentList = response2.map((a, i) => {
    //   return { userId: a.userId, userNickname: a.profileNickname, userNumber: a.classNumber, done: 0 }
    // })  

    // let tmp = {}
    // studentList.forEach(key => {
    //   tmp[key.userName] = false
    // });

    // let sortedStudentList = studentList.sort((a, b) => a.userNickname.localeCompare(b.userNickname))

    const response = await db.collection('quest').insertOne({ code: code, questName: name, questGoal: goal, questReward: reward, questExp: exp, questTitle: title, finished: [],  time: new Date() }, { upsert: true })


    if(response){
      res.status(200).json({ result: true, message: 'quest 추가 성공' });
    } else {
      res.status(402).json({result: false})
    }

  }
}