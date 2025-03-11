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
    const randomUrlArr = [
      'https://cdn.pixabay.com/photo/2014/03/25/15/23/tangerine-296654_1280.png',
      'https://cdn.pixabay.com/photo/2022/11/01/19/52/tangerine-7563214_1280.png',
      'https://cdn.pixabay.com/photo/2021/06/05/22/19/orange-6313871_1280.png',
      'https://cdn.pixabay.com/photo/2013/07/12/16/59/tangerine-151616_1280.png',
      'https://cdn.pixabay.com/photo/2022/08/25/21/25/mandarin-7411336_1280.png',
      'https://images.unsplash.com/photo-1632055214451-559fde197458?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://cdn.pixabay.com/photo/2014/04/03/11/57/fruit-312671_1280.png',
      'https://cdn.pixabay.com/photo/2021/06/04/01/12/orange-6308395_1280.png'

    ]
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
          profileUrl: randomUrlArr[Math.floor(Math.random() * randomUrlArr.length)],
          profileImgStorage: {},
          profileTitle: "초보 오렌지",
          inventory: [],
          role: 'student',
          exp: 0,
          titles: [],
          itemList: []
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