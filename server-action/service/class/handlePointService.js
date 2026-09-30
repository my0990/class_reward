import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { toNonNegativeInt } from "@/util/number/toNonNegativeInt";

/**
 * 교사가 여러 학생에게 포인트를 지급(isSend=true)하거나 회수(isSend=false)한다.
 * - 이 교사의 이 학급 학생만 변경된다 (teacher_id + classId 스코핑).
 * - history.balance는 클라이언트가 보낸 money가 아니라 변경 후 서버에서 다시 읽은 잔액이다.
 * - 잔액 변경과 기록 저장을 트랜잭션으로 묶어 한쪽만 반영되는 일이 없다.
 * - 회수는 잔액이 0 아래로 내려가는 것을 막지 않는다 (교사 판단에 맡김, 기존 동작 유지).
 */
export async function handlePointService({ teacher_id, classId, targetStudent, point, isSend }) {
  const amount = toNonNegativeInt(point);

  if (amount === null || amount === 0) {
    return { success: false, message: "포인트는 1 이상의 정수로 입력해주세요." };
  }

  if (!Array.isArray(targetStudent) || targetStudent.length === 0) {
    return { success: false, message: "대상 학생이 없습니다." };
  }

  const userIds = [...new Set(targetStudent.map((s) => s?.userId).filter(Boolean).map(String))];
  if (userIds.length === 0) {
    return { success: false, message: "대상 학생 userId가 없습니다." };
  }

  let scope;
  try {
    scope = {
      teacher_id: ObjectId.createFromHexString(teacher_id),
      classId: ObjectId.createFromHexString(classId),
    };
  } catch {
    return { success: false, message: "잘못된 학급 정보입니다." };
  }

  const inc = isSend ? amount : -amount;
  const studentFilter = { ...scope, role: "student", userId: { $in: userIds } };

  const client = await connectDB;
  const db = client.db("data");
  const session = client.startSession();

  let modifiedCount = 0;
  let updatedUserIds = [];

  try {
    await session.withTransaction(async () => {
      const result = await db
        .collection("user_data")
        .updateMany(studentFilter, { $inc: { money: inc } }, { session });
      modifiedCount = result.modifiedCount;

      // 실제로 이 학급에 있는 학생만, 변경 후 잔액으로 기록한다.
      const updatedStudents = await db
        .collection("user_data")
        .find(studentFilter, { session, projection: { userId: 1, money: 1 } })
        .toArray();
      updatedUserIds = updatedStudents.map((s) => s.userId);

      if (updatedStudents.length === 0) return;

      const now = new Date();
      await db.collection("history").insertMany(
        updatedStudents.map((s) => ({
          ...scope,
          userId: s.userId,
          balance: s.money,
          type: isSend ? "입금" : "출금",
          name: isSend ? "선생님에게 받음" : "선생님에게 뺏김",
          amount,
          date: now,
          expiresAfter: now,
        })),
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  if (updatedUserIds.length === 0) {
    return { success: false, message: "이 학급에서 대상 학생을 찾을 수 없습니다." };
  }

  return {
    success: true,
    data: {
      modifiedCount,
      userIds: updatedUserIds,
      inc,
    },
  };
}
