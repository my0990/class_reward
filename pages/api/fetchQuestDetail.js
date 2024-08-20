import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';


export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const { userId } = session.user;
    // MongoDB 연결

    const db = (await connectDB).db('data');
    const { id, code } = req.body;

    const questId = ObjectId.createFromHexString(code);
    const response = await db.collection('quest').findOne({_id: questId});
    const response2 = await db.collection('user_data').findOne({userId:id})
    console.log('------')
    console.log(response)
    // const tmp = await db.collection('teacher').find({userId:userId})
    // tmp = tmp.studentNumber
    // const response = await db.collection('quest').find({userId:userId}).toArray();
    // const data = response; 

    res.status(201).json({ result: true, message: 'delete 성공',data: response, role: session.user.role, students: response2.students});
  }
}



