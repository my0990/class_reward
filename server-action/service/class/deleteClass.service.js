import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// 학급 삭제 = 휴지통 방식
// 1) 삭제하면 바로 지우지 않고 classes 문서에 deletedAt/purgeAt을 표시한다.
//    - 학급 목록·교사 작업(authorizeTeacherClass)·조회 API에서 숨겨진다.
//    - 그 학급 학생 로그인 계정에 disabled 표시 → 로그인 불가, 로그인 중이면 최대 5분 안에 로그아웃.
// 2) 30일 안에는 복구할 수 있다.
// 3) 30일이 지나면 purgeExpiredClassesService가 학급에 딸린 데이터를 모두 지운다.
export const CLASS_TRASH_DAYS = 30;
export const MAX_ACTIVE_CLASSES = 20;
const DAY = 24 * 60 * 60 * 1000;

function toScope({ teacher_id, classId }) {
  try {
    return {
      teacherObjectId: ObjectId.createFromHexString(teacher_id),
      classObjectId: ObjectId.createFromHexString(classId),
    };
  } catch {
    throw new Error("잘못된 학급 정보입니다.");
  }
}

/** 학급을 휴지통으로 (확인용 학급 이름이 정확히 같아야 한다) */
export async function softDeleteClassService({ teacher_id, classId, confirmName, now = new Date() }) {
  const { teacherObjectId, classObjectId } = toScope({ teacher_id, classId });

  const client = await connectDB;
  const data = client.db("data");
  const userDb = client.db("user");

  const cls = await data.collection("classes").findOne({ _id: classObjectId, teacher_id: teacherObjectId });
  if (!cls) throw new Error("학급 정보를 찾을 수 없습니다.");
  if (cls.deletedAt) throw new Error("이미 삭제된 학급입니다.");
  if (String(confirmName ?? "").trim() !== String(cls.className ?? "").trim()) {
    throw new Error("학급 이름이 일치하지 않습니다.");
  }

  const purgeAt = new Date(now.getTime() + CLASS_TRASH_DAYS * DAY);
  const session = client.startSession();
  let studentCount = 0;
  try {
    await session.withTransaction(async () => {
      const r = await data.collection("classes").updateOne(
        { _id: classObjectId, teacher_id: teacherObjectId, deletedAt: { $exists: false } },
        { $set: { deletedAt: now, purgeAt } },
        { session }
      );
      if (r.matchedCount === 0) throw new Error("이미 삭제된 학급입니다.");

      const u = await userDb.collection("users").updateMany(
        { teacher_id: teacherObjectId, classId: classObjectId, role: "student" },
        { $set: { disabled: true, disabledReason: "classDeleted" } },
        { session }
      );
      studentCount = u.matchedCount;
    });
  } finally {
    await session.endSession();
  }

  return { result: true, purgeAt, studentCount };
}

/** 휴지통에서 복구 (영구 삭제 전, 활성 학급 20개 이하일 때) */
export async function restoreClassService({ teacher_id, classId, now = new Date() }) {
  const { teacherObjectId, classObjectId } = toScope({ teacher_id, classId });

  const client = await connectDB;
  const data = client.db("data");
  const userDb = client.db("user");

  const cls = await data.collection("classes").findOne({ _id: classObjectId, teacher_id: teacherObjectId });
  if (!cls) throw new Error("학급 정보를 찾을 수 없습니다.");
  if (!cls.deletedAt) throw new Error("삭제된 학급이 아닙니다.");
  if (cls.purgeAt && cls.purgeAt <= now) throw new Error("보관 기간이 지나 복구할 수 없습니다.");

  const active = await data.collection("classes").countDocuments({ teacher_id: teacherObjectId, deletedAt: { $exists: false } });
  if (active >= MAX_ACTIVE_CLASSES) {
    throw new Error(`학급은 최대 ${MAX_ACTIVE_CLASSES}개까지 사용할 수 있습니다. 다른 학급을 정리한 뒤 복구해주세요.`);
  }

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await data.collection("classes").updateOne(
        { _id: classObjectId, teacher_id: teacherObjectId },
        { $unset: { deletedAt: "", purgeAt: "" } },
        { session }
      );
      await userDb.collection("users").updateMany(
        { teacher_id: teacherObjectId, classId: classObjectId, role: "student", disabledReason: "classDeleted" },
        { $unset: { disabled: "", disabledReason: "" } },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  return { result: true };
}

/** 휴지통 목록 (교사 본인) */
export async function listDeletedClassesService({ teacher_id }) {
  let teacherObjectId;
  try {
    teacherObjectId = ObjectId.createFromHexString(teacher_id);
  } catch {
    throw new Error("잘못된 교사 정보입니다.");
  }
  const data = (await connectDB).db("data");
  const classes = await data
    .collection("classes")
    .find({ teacher_id: teacherObjectId, deletedAt: { $exists: true } })
    .sort({ deletedAt: -1 })
    .toArray();
  const counts = await data
    .collection("user_data")
    .aggregate([
      { $match: { teacher_id: teacherObjectId, role: "student", classId: { $in: classes.map((c) => c._id) } } },
      { $group: { _id: "$classId", count: { $sum: 1 } } },
    ])
    .toArray();
  const byId = new Map(counts.map((c) => [String(c._id), c.count]));
  return classes.map((c) => ({ ...c, studentsCount: byId.get(String(c._id)) ?? 0 }));
}

/** 학급에 딸린 데이터를 모두 영구 삭제 (한 트랜잭션) */
export async function purgeClassService({ teacherObjectId, classObjectId }) {
  const client = await connectDB;
  const data = client.db("data");
  const userDb = client.db("user");
  const scope = { teacher_id: teacherObjectId, classId: classObjectId };
  const removed = {};

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      // 학생 아이디 목록 (예전 형식 거래 기록·키오스크 기록 정리에 사용)
      const students = await data
        .collection("user_data")
        .find({ ...scope, role: "student" }, { session, projection: { userId: 1 } })
        .toArray();
      const userIds = students.map((s) => s.userId);

      removed.users = (await userDb.collection("users").deleteMany({ ...scope, role: "student" }, { session })).deletedCount;
      removed.students = (await data.collection("user_data").deleteMany({ ...scope, role: "student" }, { session })).deletedCount;
      removed.history = (
        await data.collection("history").deleteMany(
          { $or: [scope, { userId: { $in: userIds }, teacher_id: { $exists: false } }] },
          { session }
        )
      ).deletedCount;
      removed.quests = (await data.collection("quest").deleteMany(scope, { session })).deletedCount;
      removed.thermometer = (await data.collection("thermometer").deleteMany(scope, { session })).deletedCount;
      removed.kiosk = (
        await userDb.collection("kiosk_pwd_attempts").deleteMany({ teacher_id: teacherObjectId, userId: { $in: userIds } }, { session })
      ).deletedCount;
      removed.classData = (await data.collection("class_data").deleteMany(scope, { session })).deletedCount;
      removed.classes = (
        await data.collection("classes").deleteMany({ _id: classObjectId, teacher_id: teacherObjectId }, { session })
      ).deletedCount;
    });
  } finally {
    await session.endSession();
  }
  return removed;
}

/** 보관 기간(30일)이 지난 학급 영구 삭제. teacher_id를 주면 그 교사 것만. */
export async function purgeExpiredClassesService({ teacher_id = null, now = new Date() } = {}) {
  const filter = { deletedAt: { $exists: true }, purgeAt: { $lte: now } };
  if (teacher_id) filter.teacher_id = ObjectId.createFromHexString(teacher_id);

  const data = (await connectDB).db("data");
  const expired = await data.collection("classes").find(filter, { projection: { teacher_id: 1 } }).toArray();

  let purged = 0;
  for (const c of expired) {
    await purgeClassService({ teacherObjectId: c.teacher_id, classObjectId: c._id });
    purged++;
  }
  return { purged };
}
