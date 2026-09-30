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
  const studentFilter = {
    userId,
    role: "student",
    teacher_id: teacherObjectId,
    classId: classObjectId,
  };

  // 조회 후 삭제를 따로 하면, 동시에 두 번 눌렀을 때 둘 다 "있음"으로 보고
  // 사용 기록이 두 번 남는다. 아이템이 있을 때만 한 번에 빼고, 빼기 전 문서를 받는다.
  const before = await db.collection("user_data").findOneAndUpdate(
    { ...studentFilter, "itemList.itemId": itemId },
    { $pull: { itemList: { itemId } } },
    { returnDocument: "before" }
  );

  if (!before) {
    const studentExists = await db.collection("user_data").countDocuments(studentFilter, { limit: 1 });
    throw new Error(studentExists ? "아이템이 존재하지 않음" : "사용자 정보를 찾을 수 없습니다.");
  }

  const item = before.itemList.find((i) => i.itemId === itemId);

  await db.collection("history").insertOne({
    teacher_id: teacherObjectId,
    classId: classObjectId,
    userId,
    balance: before.money,
    type: "출금",
    amount: 0,
    date: new Date(),
    expiresAfter: new Date(),
    name: "아이템 사용 (" + (item?.itemName || itemName) + ")",
  });

  return { result: true, message: "useItem 성공" };
}
