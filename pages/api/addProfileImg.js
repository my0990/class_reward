import { connectDB } from '@/app/lib/database'
import { ObjectId } from 'mongodb';
import {getToken} from 'next-auth/jwt'
export default async function handler(req, res) {


  if (req.method === 'POST') {
    // const { url } = req.body;

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;

    
    // MongoDB 연결
    const itemId = new ObjectId()
    const newKey = "profileImgStorage." + itemId
    const db = (await connectDB).db('data');


    const response = await db.collection('class_data').updateOne({code:code},{$set: {[newKey]: {url: req.body.data, price: 99999}}},{upsert: true})



    res.status(200).json({ result: true, message: '아이템 생성 성공'});
}}