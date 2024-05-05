import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { hash } from 'bcryptjs';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const {  teacher,student } = req.body;
    console.log(req.body)


    // MongoDB 연결
    let itemId = (new ObjectId()).toString();
    const db = (await connectDB).db('user');
    const password = await hash('1234', 12)

    const response = await db.collection('users').updateOne({userId:student},{$set: {"password": password}})



    res.status(201).json({ result: true, message: '로그인 성공', itemId: itemId });
}}