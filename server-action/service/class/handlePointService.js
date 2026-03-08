import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
export async function handlePointService({ teacher_id, classId, targetStudent, point, isSend }) {
  const amount = Number(point);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: "point는 0보다 큰 숫자여야 합니다." };
  }

  if (!Array.isArray(targetStudent) || targetStudent.length === 0) {
    return { success: false, message: "대상 학생이 없습니다." };
  }

  const userIds = targetStudent.map((s) => s.userId).filter(Boolean);
  if (userIds.length === 0) {
    return { success: false, message: "대상 학생 userId가 없습니다." };
  }

  const db = (await connectDB).db('data');
  if (!db) return { success: false, message: "DB 연결 실패" };

  const inc = isSend ? amount : -amount;

  // ✅ (선택) teacherId 기반 권한 체크를 진짜로 하려면
  // teacherId가 소유한 classId를 통해 학생이 그 반 소속인지 검증 로직을 추가해야 함.
  // 지금은 구조 예시로만 남겨둠.

  const result = await db.collection("user_data").updateMany(
    { userId: { $in: userIds }, teacher_id: ObjectId.createFromHexString(teacher_id), classId: ObjectId.createFromHexString(classId)},
    { $inc: { money: inc } }
  );
  const historyArray = targetStudent.map((a) => ({ teacher_id, classId, userId: a.userId, balance: parseInt(a.money) + inc, type: isSend ? "입금" : "출금", name: isSend ? "선생님에게 받음" : "선생님에게 뺏김", amount: point, date: new Date(), expiresAfter: new Date() }))
  const response2 = await db.collection('history').insertMany(historyArray)
  return {
    success: true,
    data: {
      modifiedCount: result.modifiedCount,
      userIds,
      inc,
    },
  };
}