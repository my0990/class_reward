import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const { profileUrl, urlId} = req.body;
    console.log(req.body)

    
    // MongoDB 연결
    const db = (await connectDB).db('data');
    const fieldName = "profileUrlObj." + (urlId + 1);
    const updatedData = {isActive: false, price: 0, url: profileUrl}
    const response = await db.collection('common').updateOne({category:"profileImg"},{$set: {[fieldName]: updatedData}},{upsert: true})

    


    res.status(201).json({ result: true, message: '등록 성공',});
}}