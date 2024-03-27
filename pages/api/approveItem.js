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
    const {user, itemId, teacher} = req.body;
    // const response = await db.collection('student').updateOne({user:req.body.user},{$push: {"itemList": {id: itemId, price: parseInt(price), name: name, quantity: parseInt(quantity)}}},{upsert: true})
    const response = await db.collection('student').updateOne({ user: user,"itemList.itemId": itemId},{$set : {'itemList.$.state': '사용완료'}})
    const response2 = await db.collection('teacher').updateOne({ user: teacher,"notification.itemId": itemId},{$set : {'notification.$.state': '사용완료'}})
    // const response2 = await db.collection('teacher').updateOne({user:teacher},{$push: {"notification": {itemId: itemId, user: user, itemName: name, state: '대기중'}}},{upsert: true})
    console.log('body')
    console.log(req.body)
    console.log(teacher)
    // const tmp = await db.collection('teacher').findOne({user: 'my0990'})

    res.status(201).json({ result: true, message: 'useItem 성공' });
}}