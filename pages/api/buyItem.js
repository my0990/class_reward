import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId,role,teacher} = session.user;
    console.log(teacher)
    // MongoDB 연결
    const ItemId = req.body.itemId
    const db = (await connectDB).db('data');
    let itemId = (new ObjectId()).toString();
    
    const response = await db.collection('user_data').updateOne({userId: teacher, "itemList.itemId": ItemId},{$inc : {'itemList.$.itemQuantity': -1}})
    const response2 = await db.collection('user_data').updateOne({userId: userId},{$push: {itemList: {itemName: req.body.itemName, itemPrice: req.body.itemPrice, state: '사용 가능', itemId: itemId, teacher: teacher}}}, {upsert: true})
    const response3 = await db.collection('user_data').updateOne({userId: userId},{$inc: {money: -req.body.itemPrice}})
    res.status(201).json({ result: true, message: 'delete 성공' });
}}