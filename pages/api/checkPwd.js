import { connectDB } from '@/lib/mongodb'
import { compare } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ result: false, message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?._id) {
    return res.status(401).json({ result: false, message: '로그인이 필요합니다.' });
  }

  let teacherObjectId;
  try {
    teacherObjectId = ObjectId.createFromHexString(session.user._id);
  } catch {
    return res.status(400).json({ result: false, message: '잘못된 요청입니다.' });
  }

  const { userId, userPwd } = req.body ?? {};
  if (!userId || !userPwd) {
    return res.status(400).json({ result: false, message: '잘못된 요청입니다.' });
  }

  const db = (await connectDB).db('user');

  // 이 교사(kiosk 사용자) 소속 학생만 비밀번호 확인 대상이 되도록 스코핑
  const user = await db.collection('users').findOne({
    userId,
    role: 'student',
    teacher_id: teacherObjectId,
  });

  if (!user) {
    // 존재 여부를 알려주지 않기 위해 비밀번호 오류와 같은 메시지로 응답
    return res.status(401).json({ result: false, message: '비밀번호를 확인해주세요.' });
  }

  const hashed = user.passwordHash ?? user.password;
  if (!hashed) {
    return res.status(401).json({ result: false, message: '비밀번호를 확인해주세요.' });
  }

  const isCorrectPassword = await compare(userPwd, hashed);

  if (isCorrectPassword) {
    return res.status(200).json({ result: true, message: '비밀번호 확인 성공' });
  }

  return res.status(401).json({ result: false, message: '비밀번호를 확인해주세요.' });
}
