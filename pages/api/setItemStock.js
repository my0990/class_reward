import { connectDB } from '@/app/lib/database'
import {getToken} from 'next-auth/jwt'
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;
    // const {nickname, state} = req.body;
    // MongoDB 연결
    const {updatedItemStock, itemId} = req.body;

    const convertedItemId = itemId;

    const db = (await connectDB).db('data');
    const response = await db.collection('class_data').updateOne({code: code, "itemList.itemId": convertedItemId},{$set : {'itemList.$.itemStock': parseInt(updatedItemStock)}})
    // const respojnse2 = await db.collection('user_data').updateMany({teacher:userId},{$set: {classData: req.body.data}},{upsert: false})

    // console.log(response2)
    res.status(200).json({ result: true, message: '변경 성공' });
  }
}