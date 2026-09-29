import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function updateCurrencyNameService({
  teacher_id,
  classId,
  currencyName,
  currencyEmoji,
}) {
  if (!currencyName || !currencyEmoji) {
    throw new Error("화폐 이름과 이모지를 모두 입력해주세요.");
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

  const result = await db.collection("class_data").updateOne(
    { teacher_id: teacherObjectId, classId: classObjectId },
    { $set: { currencyName, currencyEmoji } }
  );

  if (result.matchedCount === 0) {
    throw new Error("학급 정보를 찾을 수 없습니다.");
  }

  return { result: true, message: "화폐 입력 성공" };
}
