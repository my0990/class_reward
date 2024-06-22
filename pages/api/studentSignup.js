import { hash } from 'bcryptjs';
import { connectDB } from '@/app/lib/database';
if (!process.env.MONGODB_URI) throw new Error('env error');
const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, password, teacher, userGender, userName } = req.body;
    // MongoDB 연결

    const db = (await connectDB).db('user');

    // 기존의 가입된 아이디 체크하기
    const checkExisting = await db.collection('users').findOne({ userId: userId });

    if (checkExisting) {
      client.close();
      res.status(422).json({ result: false, error: '이미 가입된 계정이에요!' });
      return;
    }

    const status = await db.collection('users').insertOne({
      userId: userId,
      // 비밀번호 암호화
      password: await hash(password, 12),
      role: 'student',
      teacher,
    });
    const db2 = (await connectDB).db('data');
    const response = await db2.collection('user_data').insertOne({
      userId: userId,
      userName: userName,
      userGender: userGender,
      money: 0,
      itemList: [],
      lv: 1,
      profileNickname: '',
      profileState: '',
      teacher,
    })
    const response2 = await db2.collection('user_data').updateOne({
      userId: teacher
    },{$inc: {'studentsCount': 1}})
    if(status && response){
      res.status(201).json({ result: true, message: 'User created', ...status });
    } else {
      res.stauts(402).json({result : false, message: 'something went wrong'})
    }

  }
}