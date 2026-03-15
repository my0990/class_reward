import { connectDB } from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { compare, hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId,role, email, _id} = session.user;

    const {currentPassword, nextPassword, } = req.body;
    // MongoDB 연결
    console.log(req.body)

    const filter = role === 'teacher' ? { email: email, _id: ObjectId.createFromHexString(_id) } : { userId: userId, _id: ObjectId.createFromHexString(_id) }

    const db = (await connectDB).db('user');
    const response = await db.collection('users').findOne(filter);
    console.log(response)
    const isCorrectPassword = await compare(
        currentPassword,
        response.passwordHash ?? response.password
    )
    const newPassword = await hash(nextPassword, 12)

    if(isCorrectPassword === false){
        return res.status(500).json({result: false, message: '비밀번호가 일치하지 않습니다.'})
    } else {
        const response2 = await db.collection('users').updateOne(filter,{$set : {passwordHash: newPassword}})
        res.status(201).json({ result: true, message: '비밀번호 변경 성공' });
    }
   


}}