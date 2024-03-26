import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const {  name, price, quantity} = req.body;
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const {id} = session.user;
    // MongoDB 연결
    let itemId = (new ObjectId()).toString();
    const db = (await connectDB).db('data');


    const response = await db.collection('teacher').updateOne({user:'my0990'},{$push: {"itemList": {id: itemId, price: parseInt(price), name: name, quantity: parseInt(quantity)}}},{upsert: true})



    res.status(201).json({ result: true, message: '로그인 성공', itemId: itemId });
}}