import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function useItemService({
  teacher_id,
  classId,
  userId,
  itemId,
  itemName,
}) {
  if (!userId || !itemId) {
    throw new Error("잘못된 요청입니다.");
  }

  let teacherObjectId;
  let classObjectId;
  try {
    teacherObjectId = ObjectId.createFromHexString(teacher_id);
    classObjectId = ObjectId.createFromHexString(classId);
  } catch {
    throw new Error("잘못된 학급 정보입니다.");
  }

  const db = (await connectDB).db("data");

  // ✅ userId만으로 매칭하지 않고 teacher_id+classId로도 스코핑해서
  // 이 교사의 이 학급 학생이 아니면 아이템을 건드릴 수 없게 막는다.
  const studentData = await db.collection("user_data").findOne({
    userId,
    role: "student",
    teacher_id: teacherObjectId,
    classId: classObjectId,
  });

  if (!studentData) {
    throw new Error("사용자 정보를 찾을 수 없습니다.");
  }

  const item = studentData.itemList?.find((i) => i.itemId === itemId);
  if (!item) {
    throw new Error("아이템이 존재하지 않음");
  }

  const response = await db.collection("user_data").updateOne(
    { userId, role: "student", teacher_id: teacherObjectId, classId: classObjectId },
    { $pull: { itemList: { itemId } } }
  );

  if (response.matchedCount === 0) {
    throw new Error("아이템 사용에 실패했습니다.");
  }

  await db.collection("history").insertOne({
    teacher_id: teacherObjectId,
    classId: classObjectId,
    userId,
    balance: studentData.money,
    type: "출금",
    amount: 0,
    date: new Date(),
    expiresAfter: new Date(),
    name: "아이템 사용 (" + (itemName || item.itemName) + ")",
  });

  return { result: true, message: "useItem 성공" };
}
