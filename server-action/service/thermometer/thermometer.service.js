import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { toNonNegativeInt } from "@/util/number/toNonNegativeInt";

export async function updateThermometerSettingService({ teacher_id, classId, rewardObj, requireCurrency }) {
  if (!teacher_id) {
    throw new Error("로그인이 필요합니다.");
  }

  // 1도 올리는 데 필요한 쿠키 수: 1 이상의 정수 (0이나 문자열이면 기부 계산이 깨진다)
  const numericRequire = toNonNegativeInt(requireCurrency);
  if (!numericRequire) {
    throw new Error("1도에 필요한 쿠키 수는 1 이상의 정수로 입력해주세요.");
  }

  if (!rewardObj || typeof rewardObj !== "object" || Array.isArray(rewardObj)) {
    throw new Error("보상 설정이 올바르지 않습니다.");
  }

  let filter;
  try {
    filter = { teacher_id: ObjectId.createFromHexString(teacher_id), classId: ObjectId.createFromHexString(classId) };
  } catch {
    throw new Error("잘못된 학급 정보입니다.");
  }

  const db = (await connectDB).db('data');
  // 학급 소유권은 action(authorizeTeacherClass)에서 확인한다. 온도계는 처음 설정할 때 만들어지므로 upsert 유지.
  await db.collection('thermometer').updateOne(filter, { $set: { reward: rewardObj, requireCurrency: numericRequire } }, { upsert: true })

  return {
    result: true,
  };

}

export async function donateCookieService({
  userId,
  amount,
  teacher_id,
  classId,
}) {
  if (!userId || !teacher_id || !classId) {
    throw new Error("필수 정보가 없습니다.");
  }

  // 쿠키는 정수 단위: 1.5개, 음수, "abc" 같은 값은 거부한다.
  const numericAmount = toNonNegativeInt(amount);
  if (!numericAmount) {
    throw new Error("기부 수량이 올바르지 않습니다.");
  }

  let teacherObjectId;
  let classObjectId;
  try {
    teacherObjectId = ObjectId.createFromHexString(teacher_id);
    classObjectId = ObjectId.createFromHexString(classId);
  } catch {
    throw new Error("잘못된 학급 정보입니다.");
  }
  const filter = { teacher_id: teacherObjectId, classId: classObjectId };

  const client = await connectDB;
  const db = client.db("data");
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const thermometer = await db.collection("thermometer").findOne(filter, { session });
      if (!thermometer) {
        throw new Error("학급 온도계 정보를 찾을 수 없습니다.");
      }

      const requireCurrency = Number(thermometer.requireCurrency);
      if (!requireCurrency || requireCurrency <= 0) {
        throw new Error("학급 온도계 설정이 올바르지 않습니다.");
      }

      // 온도 상승분은 클라이언트가 보낸 값이 아니라, 서버가 들고 있는
      // requireCurrency 기준으로 직접 계산한다 (클라이언트 조작 방지).
      const degreeIncrease = numericAmount / requireCurrency;

      const student = await db.collection("user_data").findOne(
        { userId, role: "student", teacher_id: teacherObjectId, classId: classObjectId },
        { session }
      );
      if (!student) {
        throw new Error("학생 정보를 찾을 수 없습니다.");
      }

      if (student.money < numericAmount) {
        throw new Error("보유한 쿠키가 부족합니다.");
      }

      // 1. 학생 쿠키 차감 — teacher_id/classId로 스코핑 + 잔액이 충분할 때만 원자적으로 처리
      const moneyUpdate = await db.collection("user_data").updateOne(
        {
          userId,
          role: "student",
          teacher_id: teacherObjectId,
          classId: classObjectId,
          money: { $gte: numericAmount },
        },
        { $inc: { money: -numericAmount } },
        { session }
      );
      if (moneyUpdate.matchedCount === 0) {
        throw new Error("보유한 쿠키가 부족합니다.");
      }

      // 2. 온도계 기부 누적 + 온도 상승 (서버 계산값 사용)
      await db.collection("thermometer").updateOne(
        filter,
        {
          $inc: {
            [`donators.${userId}`]: numericAmount,
            manualDegree: degreeIncrease,
          },
        },
        { session }
      );

      // 3. 히스토리 저장 (teacher_id/classId를 최상위 필드로 기록)
      await db.collection("history").insertOne(
        {
          ...filter,
          userId,
          balance: student.money - numericAmount,
          type: "출금",
          amount: numericAmount,
          date: new Date(),
          expiresAfter: new Date(),
          name: "기부",
        },
        { session }
      );
    });

    return {
      result: true,
      message: "기부가 완료되었습니다.",
    };
  } finally {
    await session.endSession();
  }
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
