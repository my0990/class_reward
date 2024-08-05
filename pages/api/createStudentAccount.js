import { connectDB } from '@/app/lib/database';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { hash } from 'bcryptjs';
export default async function handler(req, res) {

  if (req.method === 'POST') {
    const { accountArr, data } = req.body;
    console.log(accountArr, data)

    const session = await getServerSession(req,res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const {userId} = session.user;
    const accountInfo = accountArr.map((a)=> {return (
      {userId: data.uniqueNickname + a, money: 0, itemList: [],lv: 1,profileNickname: '', profileState: '', teacher: userId, classData: data.classData })})
    // MongoDB 연결
    const pwd = await hash('1234',12)
    const accountUserInfo = accountArr.map((a)=> {return ({
      userId: data.uniqueNickname + a, 
      password: pwd,
      role: 'student',
      teacher: userId}
    )})
    const db = (await connectDB).db('data');
    const response = await db.collection('user_data').updateOne({userId: userId},{"$addToSet" : {"generatedNumber" : {"$each" : accountArr}}})
    const response2 = await db.collection('user_data').insertMany(accountInfo)
    const db2 = (await connectDB).db('user');
    const response3 = await db2.collection('users').insertMany(accountUserInfo)
    res.status(201).json({ result: true, message: 'User created'});
    // [ '12', '14', '15' ]

    // 기존의 가입된 아이디 체크하기
    // const checkExisting = await db.collection('users').findOne({ userId: userId });

    // if (checkExisting) {
    //   client.close();
    //   res.status(422).json({ result: false, error: '이미 가입된 계정이에요!' });
    //   return;
    // }
 
    // const status = await db.collection('users').insertOne({
    //   userId: userId,
    //   // 비밀번호 암호화
    //   password: await hash(password, 12),
    //   role: 'student',
    //   teacher,
    // });
    // const db2 = (await connectDB).db('data');
    // const response = await db2.collection('user_data').insertOne({
    //   userId: userId,
    //   userName: userName,
    //   userGender: userGender,
    //   money: 0,
    //   itemList: [],
    //   lv: 1,
    //   profileNickname: '',
    //   profileState: '',
    //   teacher,
    // })
    // const response2 = await db2.collection('user_data').updateOne({
    //   userId: teacher
    // },{$inc: {'studentsCount': 1}})
    // if(status && response){
    //   res.status(201).json({ result: true, message: 'User created', ...status });
    // } else {
    //   res.stauts(402).json({result : false, message: 'something went wrong'})
    // }

  }
}