import { connectDB } from '@/app/lib/database'
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const db = (await connectDB).db('data');
    const {itemName, userId, itemId, balance} = req.body;
    
    // const response = await db.collection('student').updateOne({userId:req.body.userId},{$push: {"itemList": {id: itemId, price: parseInt(price), name: name, quantity: parseInt(quantity)}}},{upsert: true})
    // const response = await db.collection('user_data').updateOne({ userId: userId,"itemList.itemId": itemId},{$set : {'itemList.$.state': '대기중'}})
    const response = await db.collection('user_data').updateOne({ userId: userId, role: 'student'},{$pull : {itemList: {itemId: itemId}}})
    const response5 = await db.collection('history').insertOne({userId: userId, balance: balance, type: 'withDrawal', amount: 0, date: new Date(), name: '아이템 사용 (' + itemName + ')', expiresAfter: new Date() })


    res.status(200).json({ result: true, message: 'useItem 성공' });
}}