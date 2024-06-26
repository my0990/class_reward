import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const db = (await connectDB).db('data');
    const {itemName, userId, itemId, teacher, userName, itemPrice} = req.body;

    // const response = await db.collection('student').updateOne({userId:req.body.userId},{$push: {"itemList": {id: itemId, price: parseInt(price), name: name, quantity: parseInt(quantity)}}},{upsert: true})
    const response = await db.collection('user_data').updateOne({ userId: userId,"itemList.itemId": itemId},{$set : {'itemList.$.state': '대기중'}})
    const response2 = await db.collection('user_data').updateOne({userId:teacher},{$push: {"notification": {itemId: itemId, userId: userId, itemName: itemName, state: '대기중', userName: userName, itemPrice: itemPrice}}},{upsert: true})
    const response3 = await db.collection('user_data').updateOne({userId:teacher},{$inc: {"notificationCount": 1}}, {upsert: true})

  

    res.status(201).json({ result: true, message: 'useItem 성공' });
}}