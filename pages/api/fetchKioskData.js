import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';



export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const userId = session.user.userId;

    const db = (await connectDB).db('data')
    const response = await db.collection('user_data').findOne({userId: userId})
    const response2 = await db.collection('user_data').find({teacher: userId}).toArray()
    const tmp = response2.map((a) => { a._id = a._id.toString(); return a })
    response._id = response._id.toString();
    const classData = response.classData;
    console.log(response)
    res.status(201).json({ result: true, message: 'delete 성공',itemData: response,  studentData:tmp, classData: classData});
  }
}



