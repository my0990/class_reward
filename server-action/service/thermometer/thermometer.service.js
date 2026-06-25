import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function updateThermometerSettingService({ teacher_id, classId, rewardObj, requireCurrency }) {


  const db = (await connectDB).db('data');
  const response = await db.collection('thermometer').updateOne({ teacher_id: ObjectId.createFromHexString(teacher_id), classId: ObjectId.createFromHexString(classId) }, { $set: { "reward": rewardObj, "requireCurrency": requireCurrency } }, { upsert: true })

  return {
    result: true,
  };

}

export async function donateCookieService({
  userId,
  amount,
  money,
  teacher_id,
  classId,
  degree
}) {
  console.log("degree: " ,degree)
  const db = (await connectDB).db("data");
  const filter = {
    teacher_id: ObjectId.createFromHexString(teacher_id),
    classId: ObjectId.createFromHexString(classId),
  };
  const numericAmount = Number(amount);

  if (!userId || !teacher_id) {
    throw new Error("필수 정보가 없습니다.");
  }

  if (!numericAmount || numericAmount <= 0) {
    throw new Error("기부 수량이 올바르지 않습니다.");
  }

  // 1. 학생 쿠키 차감
  await db.collection("user_data").updateOne(
    { userId },
    {
      $inc: {
        money: -numericAmount,
      },
    }
  );

  // 2. 온도계 기부 누적
  await db.collection("thermometer").updateOne(
     filter ,
    {
      $inc: {
        [`donators.${userId}`]: numericAmount,
        manualDegree: Number(degree)
      },
    },
    {upsert: true}
  );

  // 3. 히스토리 저장
  await db.collection("history").insertOne({
    filter,
    userId,
    balance: Number(money) - numericAmount,
    type: "withDrawal",
    amount: numericAmount,
    date: new Date(),
    expiresAfter: new Date(),
    name: "기부",
  });

  return {
    result: true,
    message: "donation updated",
  };
}


export async function updateManualDegreeService({
  teacher_id,
  classId,
  degreeChange,
  type,
}) {
  if (!teacher_id) {
    throw new Error("teacher_id가 없습니다.");
  }

  if (!classId) {
    throw new Error("classId가 없습니다.");
  }

  const numericDegreeChange = Number(degreeChange);

  if (!numericDegreeChange || Number.isNaN(numericDegreeChange)) {
    throw new Error("변경할 온도 값이 올바르지 않습니다.");
  }

  if (!["increase", "decrease"].includes(type)) {
    throw new Error("type은 increase 또는 decrease만 가능합니다.");
  }

  const db = (await connectDB).db("data");

  const filter = {
    teacher_id: ObjectId.createFromHexString(teacher_id),
    classId: ObjectId.createFromHexString(classId),
  };

  const finalDegreeChange =
    type === "increase"
      ? Math.abs(numericDegreeChange)
      : -Math.abs(numericDegreeChange);

  const result = await db.collection("thermometer").findOneAndUpdate(
    filter,
    {
      $inc: {
        manualDegree: finalDegreeChange,
      },
      $set: {
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
      upsert: true,
    }
  );

  if (!result) {
    throw new Error("학급온도계 데이터를 찾을 수 없습니다.");
  }

  return {
    result: true,
    data: {
      ...result,
      _id: result._id?.toString(),
      teacher_id: result.teacher_id?.toString(),
      classId: result.classId?.toString(),
      updatedAt: result.updatedAt?.toISOString(),
    },
  };
}