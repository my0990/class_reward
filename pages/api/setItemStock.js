import { connectDB } from '@/trash/lib/database'
import { getToken } from 'next-auth/jwt'
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
export default async function handler(req, res) {


  if (req.method === 'POST') {

    const session = await getServerSession(req, res, authOptions);
    const teacher_id = session.user._id;
  
    const { updatedItemStock, itemId, classId } = req.body;

    const convertedItemId = itemId;

    const db = (await connectDB).db('data');
    const response = await db.collection('class_data').updateOne({
      teacher_id: ObjectId.createFromHexString(teacher_id),
      classId: ObjectId.createFromHexString(classId), 
      "itemList.itemId": convertedItemId
    }, { $set: { 'itemList.$.itemStock': parseInt(updatedItemStock) } })
    // const respojnse2 = await db.collection('user_data').updateMany({teacher:userId},{$set: {classData: req.body.data}},{upsert: false})

    // console.log(response2)
    res.status(200).json({ result: true, message: '변경 성공' });
  }
}