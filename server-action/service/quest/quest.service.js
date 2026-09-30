import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function toScopeFilter({ teacher_id, classId }) {
  if (!teacher_id || !classId) {
    throw new Error("teacher_id/classId가 없습니다.");
  }

  let teacherObjectId;
  let classObjectId;
  try {
    teacherObjectId = ObjectId.createFromHexString(teacher_id);
    classObjectId = ObjectId.createFromHexString(classId);
  } catch {
    throw new Error("잘못된 학급 정보입니다.");
  }

  return { teacher_id: teacherObjectId, classId: classObjectId };
}

export async function createQuestService({
  teacher_id,
  classId,
  questName,
  questGoal,
  questReward,
  questExp,
  questTitle,
}) {
  const scopeFilter = toScopeFilter({ teacher_id, classId });

  if (!questName) {
    throw new Error("퀘스트 이름을 입력해주세요.");
  }

  const db = (await connectDB).db("data");
  const questId = new ObjectId();

  await db.collection("quest").insertOne({
    _id: questId,
    ...scopeFilter,
    questName,
    questGoal: questGoal ?? "",
    questReward: Number(questReward) || 0,
    questExp: Number(questExp) || 0,
    questTitle: questTitle ?? "",
    finished: [],
    pending: [],
    time: new Date(),
  });

  return {
    result: true,
    message: "퀘스트 추가 성공",
    questId: questId.toString(),
  };
}

export async function editQuestService({
  teacher_id,
  classId,
  questId,
  questName,
  questGoal,
  questReward,
  questExp,
  questTitle,
}) {
  const scopeFilter = toScopeFilter({ teacher_id, classId });

  if (!questId) {
    throw new Error("questId가 없습니다.");
  }

  let questObjectId;
  try {
    questObjectId = ObjectId.createFromHexString(questId);
  } catch {
    throw new Error("잘못된 questId입니다.");
  }

  const db = (await connectDB).db("data");

  const result = await db.collection("quest").updateOne(
    { ...scopeFilter, _id: questObjectId },
    {
      $set: {
        questName,
        questGoal: questGoal ?? "",
        questReward: Number(questReward) || 0,
        questExp: Number(questExp) || 0,
        questTitle: questTitle ?? "",
        time: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    throw new Error("수정할 퀘스트를 찾을 수 없습니다.");
  }

  return { result: true, message: "퀘스트 수정 성공" };
}

export async function deleteQuestService({ teacher_id, classId, questId }) {
  const scopeFilter = toScopeFilter({ teacher_id, classId });

  if (!questId) {
    throw new Error("questId가 없습니다.");
  }

  let questObjectId;
  try {
    questObjectId = ObjectId.createFromHexString(questId);
  } catch {
    throw new Error("잘못된 questId입니다.");
  }

  const db = (await connectDB).db("data");

  const result = await db.collection("quest").deleteOne({
    ...scopeFilter,
    _id: questObjectId,
  });

  if (result.deletedCount === 0) {
    throw new Error("삭제할 퀘스트를 찾을 수 없거나 권한이 없습니다.");
  }

  return { result: true, message: "delete 성공" };
}

export async function resetQuestService({ teacher_id, classId, questId }) {
  const scopeFilter = toScopeFilter({ teacher_id, classId });

  if (!questId) {
    throw new Error("questId가 없습니다.");
  }

  let questObjectId;
  try {
    questObjectId = ObjectId.createFromHexString(questId);
  } catch {
    throw new Error("잘못된 questId입니다.");
  }

  const db = (await connectDB).db("data");

  const result = await db.collection("quest").updateOne(
    { ...scopeFilter, _id: questObjectId },
    { $set: { finished: [] } }
  );

  if (result.matchedCount === 0) {
    throw new Error("초기화할 퀘스트를 찾을 수 없거나 권한이 없습니다.");
  }

  return { result: true, message: "퀘스트 초기화 성공" };
}

export async function finishQuestService({
  teacher_id,
  classId,
  questData,
  rewarded,
}) {
  const scopeFilter = toScopeFilter({ teacher_id, classId });

  if (!questData?._id || !Array.isArray(rewarded) || rewarded.length === 0) {
    throw new Error("잘못된 요청입니다.");
  }

  let questObjectId;
  try {
    questObjectId = ObjectId.createFromHexString(questData._id);
  } catch {
    throw new Error("잘못된 questId입니다.");
  }

  const userIds = rewarded.map((x) => String(x.userId)).filter(Boolean);
  if (userIds.length === 0) {
    throw new Error("지급 대상이 없습니다.");
  }

  const questReward = Number(questData.questReward || 0);
  const questExp = Number(questData.questExp || 0);
  const questTitle = questData.questTitle || "";

  const client = await connectDB;
  const db = client.db("data");
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const quest = await db
        .collection("quest")
        .findOne({ ...scopeFilter, _id: questObjectId }, { session });
      if (!quest) {
        throw new Error("퀘스트를 찾을 수 없거나 권한이 없습니다.");
      }

      const inc = { money: questReward, exp: questExp };

      if (questTitle) {
        const titleId = new ObjectId();
        await db.collection("user_data").updateMany(
          { ...scopeFilter, role: "student", userId: { $in: userIds } },
          { $inc: inc, $push: { titles: { id: titleId, title: questTitle } } },
          { session }
        );
      } else {
        await db.collection("user_data").updateMany(
          { ...scopeFilter, role: "student", userId: { $in: userIds } },
          { $inc: inc },
          { session }
        );
      }

      if (questReward > 0) {
        // 최신 잔액 기준으로 history balance를 기록 (클라이언트 값 대신 서버 재조회)
        const updatedStudents = await db
          .collection("user_data")
          .find(
            { ...scopeFilter, role: "student", userId: { $in: userIds } },
            { session, projection: { userId: 1, money: 1 } }
          )
          .toArray();
        const moneyByUserId = new Map(updatedStudents.map((s) => [s.userId, s.money]));

        const historyArray = userIds.map((userId) => ({
          ...scopeFilter,
          userId,
          type: "입금",
          amount: questReward,
          name: "퀘스트 완료",
          date: new Date(),
          balance: moneyByUserId.get(userId) ?? 0,
          expiresAfter: new Date(),
        }));
        await db.collection("history").insertMany(historyArray, { session });
      }

      await db.collection("quest").updateOne(
        { ...scopeFilter, _id: questObjectId },
        { $addToSet: { finished: { $each: userIds } } },
        { session }
      );
    });

    return { result: true, message: "지급 성공" };
  } finally {
    await session.endSession();
  }
}
