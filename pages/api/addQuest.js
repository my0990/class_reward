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
    // let questId = (new ObjectId()).toString();
    const db = (await connectDB).db('data');

    // const tmp = await db.collection('teacher').find({userId:userId})
    // tmp = tmp.studentNumber
    const response2 = await db.collection('user_data').find({ teacher: userId }).sort({classNumber:1}).toArray();
    let studentList = response2.map((a, i) => {
      return { userId: a.userId, userNickname: a.profileNickname, done: 0 }
    })  

    let tmp = {}
    studentList.forEach(key => {
      tmp[key.userName] = false
    });

    // let sortedStudentList = studentList.sort((a, b) => a.userNickname.localeCompare(b.userNickname))
    console.log(studentList)
    const db2 = (await connectDB).db('quest');
    const response = await db2.collection(userId).insertOne({ questName: name, questContent: content, questReward: reward, studentList: studentList, time: new Date(), doneCount: 0,  finished: false }, { upsert: true })


    if(response){
      res.status(201).json({ result: true, message: 'quest 추가 성공' });
    } else {
      res.status(402).json({result: false})
    }

  }
}