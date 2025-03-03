import { connectDB } from '@/app/lib/database';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { hash } from 'bcryptjs';
import { getToken } from 'next-auth/jwt'
export default async function handler(req, res) {

  if (req.method === 'POST') {
    const { accountArr, uniqueNickname, updatedStudentArr } = req.body;
    const nicknameData = {
      "determiners": ["예쁜","화난","귀여운","배고픈","슬픈","푸른","비싼","밝은","부유한","귀여운","화난","똑똑한","게으른","배부른","신난","천재적인","순수한"
      ],

      "animals": ["호랑이","비버","강아지","부엉이","여우","치타","문어","고양이","미어캣","다람쥐","치와와","비글","오징어","하마","기린","판다","토끼","돌고래",
      ]
    }

    const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}
    const { userId } = session;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const code = token.code;
    const accountInfo = accountArr.map((a) => {
      return (
        {
          userId: uniqueNickname + a,
          money: 0,
          profileNickname: nicknameData.determiners[
            Math.floor(Math.random() * nicknameData.determiners.length)
          ] +
            " " +
            nicknameData.animals[
            Math.floor(Math.random() * nicknameData.animals.length)
            ],
          profileState: '',
          teacher: userId,
          classNumber: Number(a),
          profileUrl: "https://i.postimg.cc/HLXdVT11/orange.png",
          profileImgStorage: {},
          profileTitle: "초보 오렌지",
          inventory: [],
          role: 'student',
          exp: 0,
          titles: []
        })
    })
    // MongoDB 연결
    const pwd = await hash('1234', 12)
    const accountUserInfo = accountArr.map((a) => {
      return ({
        userId: uniqueNickname + a,
        password: pwd,
        role: 'student',
        teacher: userId,
        code: code
      }
      )
    })
    const db = (await connectDB).db('data');
    const response = await db.collection('user_data').insertMany(accountInfo)
    const response2 = await db.collection('class_data').updateOne({code: code}, {$set: {studentAccount: updatedStudentArr}})
    const db2 = (await connectDB).db('user');
    const response3 = await db2.collection('users').insertMany(accountUserInfo)
    
    res.status(201).json({ result: true, message: 'User created' });


  }
}