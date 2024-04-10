import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    // const {  name, price, quantity} = req.body;
    // const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    // const {id} = session.user;
    // // MongoDB 연결
    // let itemId = (new ObjectId()).toString();
    const db = (await connectDB).db('data');
    const {itemName, userId, itemId, teacher, userName, itemPrice} = req.body;
    console.log('userId: ', userId)
    // const response = await db.collection('student').updateOne({userId:req.body.userId},{$push: {"itemList": {id: itemId, price: parseInt(price), name: name, quantity: parseInt(quantity)}}},{upsert: true})
    const response = await db.collection('student').updateOne({ userId: userId,"itemList.itemId": itemId},{$set : {'itemList.$.state': '대기중'}})
    const response2 = await db.collection('teacher').updateOne({userId:teacher},{$push: {"notification": {itemId: itemId, userId: userId, itemName: itemName, state: '대기중', userName: userName, itemPrice: itemPrice}}},{upsert: true})
    const response3 = await db.collection('teacher').updateOne({userId:teacher},{$inc: {"notificationCount": 1}}, {upsert: true})

    // const tmp = await db.collection('teacher').findOne({user: 'my0990'})

    res.status(201).json({ result: true, message: 'useItem 성공' });
}}