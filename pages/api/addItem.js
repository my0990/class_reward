import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const {  itemName, itemPrice, itemQuantity, itemExplanation, emoji} = req.body;
    console.log(req.body)
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const {userId} = session.user;
    
    // MongoDB 연결
    let itemId = (new ObjectId()).toString();
    const db = (await connectDB).db('data');


    const response = await db.collection('user_data').updateOne({userId:userId},{$push: {"itemList": {itemId: itemId, itemPrice: parseInt(itemPrice), itemName: itemName, itemQuantity: parseInt(itemQuantity), itemExplanation: itemExplanation, emoji: emoji}}},{upsert: true})



    res.status(201).json({ result: true, message: '로그인 성공', itemId: itemId });
}}