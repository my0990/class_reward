import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';



export default async function handler(req, res) {
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const userId = session.user.userId;
    const db = (await connectDB).db('data')
    const response = await db.collection('user_data').findOne({userId: userId})
    const response2 = await db.collection('user_data').find({teacher: userId}).sort({classNumber:'1'}).toArray();
    if(response){ 
        res.status(201).json({ result: true, message: '고유 별명 있음',data: response, studentData: response2});
    } else {
        res.status(201).json({result: false, message: '고유 별명 없음'});
    }

  }
}



