import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';



export default async function handler(req, res) {

  console.log('test')
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const userId = req.body.userId
    console.log(req.body) 
    const db = (await connectDB).db('data')
    const response = await db.collection('history').find({userId: userId}).sort({date: '1'}).toArray()
    res.status(201).json({ result: true, message: 'delete 성공', data: response});
  }
}
