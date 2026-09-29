import { connectDB } from '@/lib/mongodb'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';


export default async function handler(req, res) {

  if (req.method !== 'POST') {
    res.status(405).json({ result: false, error: 'Method Not Allowed' });
    return;
  }

  const session = await getServerSession(req, res, authOptions); //{user: {name: '아이묭', id: 'my0990}}

  // ✅ 세션이 없으면(만료 등) 여기서 바로 401 JSON을 내려준다.
  // 이전엔 session이 null이어도 그대로 session.user._id를 읽어서 여기서 예외가 터졌고,
  // 그 결과 클라이언트(CreateUniqueNickname.js)가 JSON이 아닌 에러 페이지를 res.json()으로
  // 파싱하려다 실패해서 로딩 상태가 영원히 풀리지 않는 문제로 이어졌다.
  if (!session?.user?._id) {
    res.status(401).json({ result: false, error: '로그인이 필요합니다.' });
    return;
  }

  const teacher_id = session.user._id;
  const db = (await connectDB).db('data');
  const checkExisting = await db.collection('class_data').findOne({ uniqueNickname: req.body.uniqueNickname });

  if (checkExisting) {
    res.status(422).json({ result: false, error: '이미 가입된 계정이에요!' });
    return;
  }

  await db.collection('class_data').updateOne(
    {
      teacher_id: ObjectId.createFromHexString(teacher_id),
      classId: ObjectId.createFromHexString(req.body.classId)
    },
    { $set: { uniqueNickname: req.body.uniqueNickname } },
    { upsert: true })

  res.status(201).json({ result: true, message: '닉네임 등록 성공' });
}
