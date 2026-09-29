import { connectDB } from '@/lib/mongodb'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?._id) {
    res.status(401).json({ error: '로그인이 필요합니다.' })
    return
  }

  let teacherObjectId
  try {
    teacherObjectId = ObjectId.createFromHexString(session.user._id)
  } catch {
    res.status(400).json({ error: '잘못된 세션입니다.' })
    return
  }

  const userId = req.query.id
  const db = (await connectDB).db('data')

  // ✅ 이 요청을 보낸 교사가 실제로 이 학생의 담임인지 확인한다.
  // (이전에는 이 확인 없이 userId만으로 아무 학생의 전체 사용 기록을 조회할 수 있었음)
  const owns = await db.collection('user_data').findOne({
    userId,
    teacher_id: teacherObjectId,
    role: 'student',
  })

  if (!owns) {
    res.status(403).json({ error: '조회 권한이 없습니다.' })
    return
  }

  const response = await db.collection('history').find({ userId }, { projection: { code: 0 } }).sort({ date: -1 }).toArray()
  res.status(200).json(response)
}
