import { MongoClient } from 'mongodb';
import { hash } from 'bcryptjs';
import { connectDB } from '@/app/lib/database';
if (!process.env.MONGODB_URI) throw new Error('env error');
const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id, password, name, admin, teacher, nickname, gender } = req.body;
    // MongoDB 연결
    const client = await MongoClient.connect(uri);
    const db = client.db('user');
	
    // 기존의 가입된 아이디 체크하기
    const checkExisting = await db.collection('users').findOne({ userId: id });

    if (checkExisting) {
      client.close();
      res.status(422).json({ result: false, error: '이미 가입된 계정이에요!' });
      return;
    }
    if(!admin){
      const status = await db.collection('users').insertOne({
        userId: id,
        // 비밀번호 암호화
        password: await hash(password, 12),
        teacher,
        role: 'student',
        userName:name,
        gender: gender

      });
      const db2 = (await connectDB).db('data')
      const status2 = await db2.collection('student').insertOne({
        userId: id,
        userName: name,
        money: 0,
        teacher: teacher,
        itemList: [],
        lv: 0,
        profileNickname: nickname,
        gender: gender
        
      })
      res.status(201).json({result: true, message: 'User created'})
      return
    }
    const status = await db.collection('users').insertOne({
      userId: id,
      // 비밀번호 암호화
      password: await hash(password, 12),
      role: 'teacher',
      userName: name

    });
    const db2 = (await connectDB).db('data')
    const status2 = await db2.collection('teacher').insertOne({
      userId: id,
      userName: name,
      money: 0,
      itemList: [],
      notification: [],
      notificationCount: 0
    })
    // 성공시 response
    res.status(201).json({ result: true, message: 'User created', ...status });
    client.close();
  } else {
    res.status(500).json({ result: false, error: 'Route not valid' });
  }
}