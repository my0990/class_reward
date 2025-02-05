import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';



export default async function handler(req, res) {

  if (req.method === 'GET') {
    const userId = req.params;
    // console.log('test')
    // console.log(req.query)
    // console.log(userId)
    const db = (await connectDB).db('data')
    const response = await db.collection('history').find({userId: req.query.id}).sort({date: '1'}).toArray()
    res.status(200).json(response);
  }
}
