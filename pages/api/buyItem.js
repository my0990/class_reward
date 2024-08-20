import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId,role,teacher} = session.user;
    console.log(session)
    let teacherId = null
    if(role === 'student'){
      teacherId = teacher
    } else {
      userId = req.body.userId
      teacherId = session.user.userId
    }
    console.log(session.user.userId)

    // MongoDB 연결
    const itemData = req.body.itemData;
    const balance = req.body.balance
    console.log(itemData)
    console.log(req.body)
    const db = (await connectDB).db('data');
    let itemId = (new ObjectId()).toString();
    const ItemId = itemData.itemId;
    const response = await db.collection('user_data').updateOne({userId: teacherId, "itemList.itemId": ItemId},{$inc : {'itemList.$.itemQuantity': -1}})
    const response2 = await db.collection('user_data').updateOne({userId: userId},{$push: {itemList: {itemName: itemData.itemName, itemPrice: itemData.itemPrice, state: '사용 가능', itemId: itemId, teacher: teacherId, itemEmoji: itemData.emoji, itemExplanation: itemData.itemExplanation}}}, {upsert: true})
    const response3 = await db.collection('user_data').updateOne({userId: userId},{$inc: {money: -itemData.itemPrice}})
    const response4 = await db.collection('history').insertOne({userId: userId,balance: balance, type: 'withDrawal', amount: itemData.itemPrice, date: new Date(),expiresAfter: new Date(), name: itemData.itemName + ' 구입'})
    res.status(201).json({ result: true, message: 'delete 성공', itemId: itemId });
}}