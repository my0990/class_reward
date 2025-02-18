import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';



export default async function handler(req, res) {

  if (req.method === 'GET') {
    
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const db = (await connectDB).db('data')
    const response = await db.collection('user_data').findOne({userId: session.userId, role: session.role})
    res.status(200).json(response); 
  }
}
