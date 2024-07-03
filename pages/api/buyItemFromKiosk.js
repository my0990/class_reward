import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}

    let teacherId = session.user.userId;
    const {itemData,userId} = req.body;
    console.log(userId)
    console.log(req.body)
    // MongoDB 연결
    // const ItemId = req.body.itemId
    const db = (await connectDB).db('data');
    let itemId = (new ObjectId()).toString();

    const response = await db.collection('user_data').updateOne({userId: teacherId, "itemList.itemId": itemData.ItemId},{$inc : {'itemList.$.itemQuantity': -1}})
    const response2 = await db.collection('user_data').updateOne({userId: userId},{$push: {itemList: {itemName: itemData.itemName, itemPrice: itemData.itemPrice, state: '사용 가능', itemId: itemId, teacher: teacherId}}}, {upsert: true})
    const response3 = await db.collection('user_data').updateOne({userId: userId},{$inc: {money: -itemData.itemPrice}})
    res.status(201).json({ result: true, message: 'buy 성공' });
}}