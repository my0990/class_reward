import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';


export default async function handler(req, res) {


  if (req.method === 'GET') {
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}

    // MongoDB 연결

    const db = (await connectDB).db('data');
    const questId = ObjectId.createFromHexString(req.query.code);
    const response = await db.collection('quest').findOne({_id: questId});

    // const tmp = await db.collection('teacher').find({userId:userId})
    // tmp = tmp.studentNumber
    // const response = await db.collection('quest').find({userId:userId}).toArray();
    // const data = response; 

    res.status(200).json(response);
  }
}



