import { MongoClient } from 'mongodb';
import { hash, compare } from 'bcryptjs';
import { connectDB } from '@/app/lib/database';



export default async function handler(req, res) {


  if (req.method === 'POST') {
    const { id, password } = req.body;
	
    // MongoDB 연결
    const db = (await connectDB).db('user');
    // 기존의 가입된 아이디 체크하기
    const response = await db.collection('users').findOne({ userId: id });
    if (!response) {
        res.status(422).json({ result: false, error: '아이디나 비밀번호가 일치하지 않습니다' });
        return;
      }

    const isCorrectPassword = await compare(
        password,
        response.password
    )



	
    // 성공시 response
    if(isCorrectPassword){
        res.status(201).json({ result: true, message: '로그인 성공',name: response.name});
    }


  } else {
    res.status(500).json({ result: false, error: 'Route not valid' });
  }
}