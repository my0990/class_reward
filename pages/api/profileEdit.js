import { connectDB } from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}

    let { _id, email, userId, role } = session.user;

    const { profileNickname, profileState } = req.body;
    const db = (await connectDB).db('data');
    const db2 = (await connectDB).db('user');
    const filter = role === 'teacher' ? { email: email, _id: ObjectId.createFromHexString(_id) } : { userId: userId, _id: ObjectId.createFromHexString(_id) }
    const user_res = await db2.collection('users').findOne(filter)
    // MongoDB 연결

    if (user_res) {
      const response = await db.collection("user_data").updateOne({ userId: role === "teacher" ? email : userId, role: role, }, { $set: { profileNickname: profileNickname, profileState: profileState } }, { upsert: true })
    }




    res.status(200).json({ result: true, message: 'profile 변경 성공' });
  }
}