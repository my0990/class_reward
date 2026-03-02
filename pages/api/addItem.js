import { connectDB } from '@/app/lib/database'
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const { itemName, itemPrice, itemStock, itemExplanation, emoji, classId } = req.body;

    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}

    const teacher_id = session.user._id;



    // MongoDB 연결
    let itemId = new ObjectId().toString();
    const db = (await connectDB).db('data');


    const response = await db.collection('class_data').updateOne({
      teacher_id: ObjectId.createFromHexString(teacher_id),
      classId: ObjectId.createFromHexString(req.body.classId)
    },
      { $push: { "itemList": { itemId: itemId, itemPrice: parseInt(itemPrice), itemName: itemName, itemStock: parseInt(itemStock), itemExplanation: itemExplanation, emoji: emoji } } },
      { upsert: true })



    res.status(200).json({ result: true, message: '아이템 생성 성공', itemId: itemId });
  }
}