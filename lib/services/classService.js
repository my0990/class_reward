import { connectDB } from "../mongodb";

export async function createClass({ className, teacherId }) {
  if (!className) throw new Error('학급 이름 필요');
  const db = (await connectDB).db('data');


  const existingCount = await db.collection("classes").countDocuments({ teacherId });
  console.log(existingCount)
  if (existingCount >= 20) {
    throw new Error("학급은 최대 20개까지만 생성할 수 있습니다.");
  }

  const obj = {};
  for (let i = 1; i <= 40; i++) {
    obj[i] = false;
  }
  const newClass = {
    className,
    teacherId,
    studentAccounts: obj,
    uniqueNickname: null,
  };

  const result = await db.collection('classes').insertOne({ ...newClass });

  const newClassData = {
    classId: result.insertedId,          // 🔑 classes._id와 연결
    teacherId: teacherId,      // 소유자 확인용
    itemList: [],              // 학급 아이템 초기화
    studentPoints: {},         // 학생 점수 초기화
    createdAt: new Date(),
  };

  const result2 = await db.collection("class_data").insertOne(newClassData);

  // 반환 시 classes 정보와 class_data id도 포함 가능
  // return {
  //   _id: classId.toString(),
  //   ...newClass,
  //   classDataId: newClassData._id?.toString() || null, // 필요하면 반환
  // };
  return { _id: result.insertedId.toString(), ...newClass };
}

export async function getClassesByTeacher(teacherId) {
  const db = (await connectDB).db('data');
  return db.collection('classes').find({ teacherId }).toArray();
}