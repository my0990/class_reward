import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import {getToken }from 'next-auth/jwt'
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const { student, classNumber } = req.body;
    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}

    // MongoDB 연결
    let itemId = (new ObjectId()).toString();
    const db = (await connectDB).db('user');  
    const db2 = (await connectDB).db('data')

    const response = await db.collection('users').deleteOne({userId:student})
    const response2 = await db2.collection('user_data').deleteOne({userId:student})

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;
    let newKey = "studentAccount." + classNumber

    const response3 = await db2.collection('class_data').updateOne({code: code},{$set: {[newKey]: false}})


    res.status(201).json({ result: true, message: '계정 삭제 성공'});


}}