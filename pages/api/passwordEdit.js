import { connectDB } from '@/app/lib/database'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { compare, hash } from 'bcryptjs';
export default async function handler(req, res) {


  if (req.method === 'POST') {
    const session = await getServerSession(req,res,authOptions); //{user: {name: '아이묭', id: 'my0990}}
    let {userId,role,teacher} = session.user;
    const {currentPassword, nextPassword, nextPasswordConfirm} = req.body;
    // MongoDB 연결

    const db = (await connectDB).db('user');

    const response = await db.collection('users').findOne({userId:userId});
    const isCorrectPassword = await compare(
        currentPassword,
        response.password
    )
    const newPassword = await hash(nextPassword, 12)

    if(isCorrectPassword === false){
        return res.status(500).json({result: false, message: '비밀번호가 일치하지 않습니다.'})
    } else {
        const response2 = await db.collection('users').updateOne({userId: userId},{$set : {password: newPassword}})
        res.status(201).json({ result: true, message: '비밀번호 변경 성공' });
    }
   


}}