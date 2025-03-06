import { connectDB } from '@/app/lib/database'



export default async function handler(req, res) {
  if (req.method === 'GET') {
    const db = (await connectDB).db('data')
    const response = await db.collection('history').find({userId: req.query.id}).sort({date: -1}).toArray()
    res.status(200).json(response);
  }
}
