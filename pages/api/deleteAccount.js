import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {


  if (req.method === 'POST') {
    const {  teacher,student } = req.body;
    console.log(req.body)


    // MongoDB 연결
    let itemId = (new ObjectId()).toString();
    const db = (await connectDB).db('user');
    const db2 = (await connectDB).db('data')

    const response = await db.collection('users').deleteOne({userId:student})
    const response2 = await db2.collection('student').deleteOne({userId:student})



    res.status(201).json({ result: true, message: '로그인 성공', itemId: itemId });


}}