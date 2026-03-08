import { connectDB } from '@/trash/lib/database'

import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function handler(req, res) {


  if (req.method === 'POST') {
    // MongoDB 연결
    const deleteId = req.body.itemId
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}



    const teacher_id = session.user._id;
    const db = (await connectDB).db('data');

    const response = await db.collection('class_data').updateOne(
      {
        teacher_id: ObjectId.createFromHexString(teacher_id),
        classId: ObjectId.createFromHexString(req.body.classId)
      },
      { $pull: { "itemList": { "itemId": deleteId } } }
    );
    res.status(200).json({ result: true, message: 'delete 성공' });
  }
}