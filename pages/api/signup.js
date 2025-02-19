import { hash } from 'bcryptjs';
import { connectDB } from '@/app/lib/database';
import { v4 as uuidv4 } from 'uuid';

if (!process.env.MONGODB_URI) throw new Error('env error');
const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id, password } = req.body;
    // MongoDB 연결
    const db = (await connectDB).db('user')

    // 기존의 가입된 아이디 체크하기
    const checkExisting = await db.collection('users').findOne({ userId: id, role: 'teacher' });

    if (checkExisting) {

      res.status(422).json({ result: false, error: '이미 가입된 계정이에요!' });
      return;
    }
    const uniqueCode = uuidv4();
    const status = await db.collection('users').insertOne({
      userId: id,
      // 비밀번호 암호화
      password: await hash(password, 12),
      role: 'teacher',
      code: uniqueCode,

    });
    const db2 = (await connectDB).db('data')
    const status2 = await db2.collection('user_data').insertOne({
      userId: id,
      money: 0,
      role: 'teacher',
      profileNickname: '',
      profileState: '',
      profileUrl: 'https://i.postimg.cc/XYzP6hfz/2024-11-22-9-44-07.png',
      profileUrlObj: []
    })
    // 성공시 response

    const studentArr = {};
    for (let i = 1; i <= 30; i++) {
      studentArr[i] = false;
    }
    const status3 = await db2.collection('class_data').insertOne({
      teacherId: id,
      code: uniqueCode,
      studentAccount: studentArr,
      itemList: [],
    })

    const status4 = await db2.collection('thermometer').insertOne({
      code: uniqueCode,
      isActive: false,
      requireCurrency: 1,
      reward: {0: "", 10: "", 20: "", 30: "", 40: "", 50: "", 60: "", 70: "", 80: "", 90: "", 100: ""},
      donators: {},
      adjustment: 0,
    })
    res.status(201).json({ result: true, message: 'User created', ...status });

  } else {
    res.status(500).json({ result: false, error: 'Route not valid' });
  }
}