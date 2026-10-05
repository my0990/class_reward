import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";

// 학급 이름: 앞뒤 공백 제거, 연속 공백은 한 칸으로, 1~30자
export const CLASS_NAME_MAX = 30;

/** 올바르면 { name }, 아니면 { error } */
export function normalizeClassName(value) {
  const name = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!name) return { error: "학급 이름을 입력해주세요." };
  if (name.length > CLASS_NAME_MAX) return { error: `학급 이름은 ${CLASS_NAME_MAX}자까지 쓸 수 있습니다.` };
  return { name };
}

/**
 * 학급 이름 바꾸기. 이름이 classes와 class_data 두 곳에 있어서 트랜잭션으로 같이 바꾼다.
 * 권한 확인(authorizeTeacherClass)은 action에서 한다. 휴지통 학급은 바꾸지 않는다.
 */
export async function renameClassService({ teacher_id, classId, className }) {
  const v = normalizeClassName(className);
  if (v.error) return { ok: false, message: v.error };

  const client = await connectDB;
  const db = client.db("data");
  const teacherOid = ObjectId.createFromHexString(teacher_id);
  const classOid = ObjectId.createFromHexString(classId);

  const session = client.startSession();
  try {
    let found = false;
    await session.withTransaction(async () => {
      const r = await db
        .collection("classes")
        .updateOne(
          { _id: classOid, teacher_id: teacherOid, deletedAt: { $exists: false } },
          { $set: { className: v.name } },
          { session }
        );
      found = r.matchedCount === 1;
      if (!found) return;
      await db
        .collection("class_data")
        .updateOne({ classId: classOid, teacher_id: teacherOid }, { $set: { className: v.name } }, { session });
    });
    if (!found) return { ok: false, message: "학급 정보를 찾을 수 없습니다." };
    return { ok: true, className: v.name };
  } finally {
    await session.endSession();
  }
}
