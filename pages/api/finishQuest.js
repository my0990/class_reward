import { connectDB } from "@/trash/lib/database";
import { ObjectId } from "mongodb";
import { buildFilter } from "@/lib/api/buildFilter";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ result: false, error: "Method Not Allowed" });
    }

    const scopeFilter = await buildFilter(req, res, { classIdRequired: true });

    const db = (await connectDB).db("data");

    const { questData, rewarded } = req.body || {};
    if (!questData?._id || !Array.isArray(rewarded) || rewarded.length === 0) {
      return res.status(400).json({ result: false, error: "Invalid body" });
    }

    const questId = ObjectId.createFromHexString(questData._id);

    // ✅ DB의 userId 타입에 맞추세요.
    // 1) userId가 문자열로 저장된 경우:
    const userIds = rewarded.map((x) => String(x.userId));
    console.log(req.body)
    console.log(userIds)
    // 2) userId가 ObjectId로 저장된 경우(이 줄로 교체):
    // const userIds = rewarded.map((x) => ObjectId.createFromHexString(x.userId));

    const questReward = Number(questData.questReward || 0);
    const questExp = Number(questData.questExp || 0);
    const questTitle = questData.questTitle || "";

    // ✅ 학생 지급 (scopeFilter 포함 + upsert false)
    const inc = { money: questReward, exp: questExp };

    if (questTitle) {
      const titleId = new ObjectId();
      await db.collection("user_data").updateMany(
        { ...scopeFilter, role: "student", userId: { $in: userIds } },
        { $inc: inc, $push: { titles: { id: titleId, title: questTitle } } },
        { upsert: false }
      );
    } else {
      await db.collection("user_data").updateMany(
        { ...scopeFilter, role: "student", userId: { $in: userIds } },
        { $inc: inc },
        { upsert: false }
      );
    }

    // ✅ 히스토리 (questReward 있을 때만)
    if (questReward > 0) {
      const historyArray = rewarded.map((a) => ({
        ...scopeFilter,
        userId: String(a.userId), // ObjectId라면 위에 맞춰서 동일하게 바꾸기
        type: "deposit",
        amount: questReward,
        name: "퀘스트 완료",
        date: new Date(),
        // ⚠️ balance를 클라 값으로 계산하는 건 위험함(동시성/조작 가능)
        // 일단 유지하되, 나중에 서버에서 현재 money 조회 후 계산 권장
        balance: Number(a.money || 0) + questReward,
        expiresAfter: new Date(),
      }));
      await db.collection("history").insertMany(historyArray);
    }

    // ✅ 퀘스트 finished 반영 (scopeFilter 포함)
    await db.collection("quest").updateOne(
      { ...scopeFilter, _id: questId },
      { $addToSet: { finished: { $each: userIds } } }
    );

    return res.status(201).json({ result: true, message: "지급 성공" });
  } catch (e) {
    return res.status(e?.status ?? 500).json({ result: false, error: e?.message ?? "Server Error" });
  }
}