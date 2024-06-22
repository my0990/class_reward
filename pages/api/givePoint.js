import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

export default async function handler(req, res) {


  if (req.method === 'POST') {
    const {userId, point} = req.body;
    console.log(point, typeof(point))
    console.log(userId)
    // const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    // const {id} = session.user;
    // // MongoDB 연결
    // let itemId = (new ObjectId()).toString();
    const db = (await connectDB).db('data');


    const response = await db.collection('user_data').updateOne({userId:userId},{$inc: {money: parseInt(point)}})



    res.status(201).json({ result: true, message: '로그인 성공'});
}}