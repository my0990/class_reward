import { connectDB } from '@/app/lib/database'



export default async function handler(req, res) {

  if (req.method === 'GET') {

    const db = (await connectDB).db('data')
    const response = await db.collection('user_data').findOne({userId: req.query.id, role: 'student'})
    res.status(200).json(response);
  }
}
