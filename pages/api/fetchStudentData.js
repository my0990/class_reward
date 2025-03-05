import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';




export default async function handler(req, res) {

  if (req.method === 'GET') {
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const db = (await connectDB).db('data')
    let teacher = null;
    if(session.role=== 'teacher'){
        teacher = session.userId
    } else {
        teacher = session.teacher
    }
    const response = await db.collection('user_data').find({ teacher: teacher}).sort({ classNumber: 1 }).toArray()
    res.status(200).json(response); 
  }
}
