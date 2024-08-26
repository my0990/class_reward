import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';



export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let userId = null;
    if(session.user.role === 'teacher'){
      userId = session.user.userId;
    } else {
      userId = session.user.teacher;
    }
    const db = (await connectDB).db('data');
    const response = await db.collection('quest').find({userId: userId}).sort({time:'-1'}).toArray();


    let studentsCount = response.done;

    res.status(201).json({ result: true, message: 'delete 성공',data: response, teacher: userId, role: session.user.role});
  }
}



