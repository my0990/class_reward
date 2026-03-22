import { connectDB } from '@/trash/lib/database'
import { ObjectId } from 'mongodb';
import {getToken} from 'next-auth/jwt'
import { buildFilter } from '@/lib/api/buildFilter';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    // const { url } = req.body;

    const scopeFilter = await buildFilter(req, res, { classIdRequired: true });

    
    // MongoDB 연결
    const itemId = new ObjectId()
    const newKey = "profileImgStorage." + itemId
    const db = (await connectDB).db('data');


    const response = await db.collection('class_data').updateOne({...scopeFilter},{$set: {[newKey]: {url: req.body.data, price: 99999}}},{upsert: true})



    res.status(200).json({ result: true, message: '아이템 생성 성공', itemId: itemId});
}}