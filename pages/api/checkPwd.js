import { connectDB } from '@/app/lib/database'
import { compare } from "bcryptjs";


export default async function handler(req, res) {

  if (req.method === 'POST') {
    const db = (await connectDB).db('user');
    const {userId,userPwd} = req.body;

    const user = await db.collection('users').findOne({ userId: userId, role: "student" });

    const isCorrectPassword = await compare(
        userPwd,
        user.password
    )
    if(isCorrectPassword){
      res.status(200).json({ result: true, message: 'delete 성공'});
    } else {
      res.status(402).json({result: false, message: 'wrong pwd'})
    }

  }
}



