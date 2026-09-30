// 테스트 공용 MongoDB 헬퍼
//
// 서비스 코드는 "@/lib/mongodb"의 connectDB(진짜 DB에 붙는 Promise)를 그대로 쓴다.
// 테스트 파일에서 아래처럼 mock을 걸면, connectDB가 메모리 DB(mongodb-memory-server)
// 클라이언트로 바뀐다. 진짜 DB는 절대 건드리지 않는다.
//
//   vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
//   const mongo = setupTestMongo();   // beforeAll/afterAll/beforeEach 자동 등록
//   mongo.db                          // "data" DB
//
// 트랜잭션(session.withTransaction)을 쓰는 서비스가 많아서 단일 노드 레플리카셋으로 띄운다.
import { beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";

let resolveConnectDB;
const connectDBPromise = new Promise((resolve) => {
  resolveConnectDB = resolve;
});

export const mongodbMock = { connectDB: connectDBPromise };

export function setupTestMongo() {
  const ctx = { client: null, db: null, replSet: null };

  beforeAll(async () => {
    ctx.replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    ctx.client = new MongoClient(ctx.replSet.getUri());
    await ctx.client.connect();
    ctx.db = ctx.client.db("data");
    resolveConnectDB(ctx.client);
  }, 60000);

  afterAll(async () => {
    await ctx.client?.close();
    await ctx.replSet?.stop();
  });

  // 테스트끼리 데이터가 섞이지 않도록 매번 비운다.
  beforeEach(async () => {
    const collections = await ctx.db.collections();
    await Promise.all(collections.map((c) => c.deleteMany({})));
  });

  return ctx;
}

/** 테스트용 교사/학급 id 한 세트 (hex 문자열 + ObjectId) */
export function makeScope() {
  const teacher = new ObjectId();
  const klass = new ObjectId();
  return {
    teacher_id: teacher.toHexString(),
    classId: klass.toHexString(),
    teacherObjectId: teacher,
    classObjectId: klass,
  };
}

export async function seedStudent(db, scope, { userId, money = 0, ...rest }) {
  await db.collection("user_data").insertOne({
    userId,
    role: "student",
    teacher_id: scope.teacherObjectId,
    classId: scope.classObjectId,
    money,
    itemList: [],
    ...rest,
  });
}

export async function seedClassData(db, scope, fields = {}) {
  await db.collection("class_data").insertOne({
    teacher_id: scope.teacherObjectId,
    classId: scope.classObjectId,
    itemList: [],
    ...fields,
  });
}

export async function getStudent(db, userId) {
  return db.collection("user_data").findOne({ userId });
}
