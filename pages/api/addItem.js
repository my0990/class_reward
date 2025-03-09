import { connectDB } from '@/app/lib/database'
import { ObjectId } from 'mongodb';
import {getToken} from 'next-auth/jwt'
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const {  itemName, itemPrice, itemStock, itemExplanation, emoji} = req.body;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;

    
    // MongoDB 연결
    let itemId = new ObjectId().toString();
    const db = (await connectDB).db('data');


    const response = await db.collection('class_data').updateOne({code:code},{$push: {"itemList": {itemId: itemId, itemPrice: parseInt(itemPrice), itemName: itemName, itemStock: parseInt(itemStock), itemExplanation: itemExplanation, emoji: emoji}}},{upsert: true})



    res.status(200).json({ result: true, message: '아이템 생성 성공', itemId: itemId });
}}