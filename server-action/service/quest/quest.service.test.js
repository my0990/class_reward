import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";

// quest.service.js는 "@/lib/mongodb"의 connectDB(진짜 Atlas에 붙는 Promise)를 그대로 가져다 쓴다.
// 테스트에서는 진짜 DB 대신 mongodb-memory-server(단일 노드 레플리카셋, 트랜잭션 지원)로 붙인
// MongoClient를 resolve하는 가짜 Promise로 갈아끼운다.
//
// vi.mock 팩토리는 파일 상단으로 호이스팅되어 import보다 먼저 평가되므로,
// 팩토리 안에서 참조하는 변수는 반드시 vi.hoisted()로 감싸야 한다.
const { connectDBPromise, resolveConnectDB } = vi.hoisted(() => {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { connectDBPromise: promise, resolveConnectDB: resolve };
});

vi.mock("@/lib/mongodb", () => ({
  connectDB: connectDBPromise,
}));

const { createQuestService, finishQuestService } = await import(
  "./quest.service.js"
);

let replSet;
let client;
let db;

const TEACHER_ID = new ObjectId().toHexString();
const CLASS_ID = new ObjectId().toHexString();
const OTHER_TEACHER_ID = new ObjectId().toHexString();
const OTHER_CLASS_ID = new ObjectId().toHexString();

beforeAll(async () => {
  // 트랜잭션(session.withTransaction)을 쓰는 finishQuestService를 검증하려면
  // standalone mongod가 아니라 레플리카셋이 필요하다.
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  client = new MongoClient(replSet.getUri());
  await client.connect();
  db = client.db("data");
  resolveConnectDB(client);
}, 60000);

afterAll(async () => {
  await client?.close();
  await replSet?.stop();
});

beforeEach(async () => {
  await db.collection("quest").deleteMany({});
  await db.collection("user_data").deleteMany({});
  await db.collection("history").deleteMany({});
});

async function seedStudent({ userId, money = 0, exp = 0 }) {
  await db.collection("user_data").insertOne({
    userId,
    role: "student",
    teacher_id: ObjectId.createFromHexString(TEACHER_ID),
    classId: ObjectId.createFromHexString(CLASS_ID),
    money,
    exp,
    titles: [],
  });
}

describe("createQuestService", () => {
  it("teacher_id/classId로 스코핑된 퀘스트를 생성한다", async () => {
    const res = await createQuestService({
      teacher_id: TEACHER_ID,
      classId: CLASS_ID,
      questName: "책 읽기",
      questReward: 100,
      questExp: 10,
    });

    expect(res.result).toBe(true);
    expect(res.questId).toBeTruthy();

    const saved = await db
      .collection("quest")
      .findOne({ _id: ObjectId.createFromHexString(res.questId) });
    expect(saved.questName).toBe("책 읽기");
    expect(saved.questReward).toBe(100);
    expect(saved.teacher_id.toHexString()).toBe(TEACHER_ID);
    expect(saved.classId.toHexString()).toBe(CLASS_ID);
    expect(saved.finished).toEqual([]);
  });

  it("questName이 없으면 에러를 던진다", async () => {
    await expect(
      createQuestService({
        teacher_id: TEACHER_ID,
        classId: CLASS_ID,
        questName: "",
      })
    ).rejects.toThrow("퀘스트 이름을 입력해주세요.");
  });

  it("teacher_id/classId가 잘못된 ObjectId 형식이면 에러를 던진다", async () => {
    await expect(
      createQuestService({
        teacher_id: "not-an-object-id",
        classId: CLASS_ID,
        questName: "책 읽기",
      })
    ).rejects.toThrow("잘못된 학급 정보입니다.");
  });
});

describe("finishQuestService", () => {
  it("지급 대상 학생들의 money/exp를 올리고 finished에 기록한다", async () => {
    await seedStudent({ userId: "student-1", money: 100, exp: 5 });
    await seedStudent({ userId: "student-2", money: 0, exp: 0 });

    const created = await createQuestService({
      teacher_id: TEACHER_ID,
      classId: CLASS_ID,
      questName: "책 읽기",
      questReward: 50,
      questExp: 10,
    });

    const res = await finishQuestService({
      teacher_id: TEACHER_ID,
      classId: CLASS_ID,
      questData: { _id: created.questId, questReward: 50, questExp: 10 },
      rewarded: [{ userId: "student-1" }, { userId: "student-2" }],
    });

    expect(res.result).toBe(true);

    const student1 = await db.collection("user_data").findOne({ userId: "student-1" });
    const student2 = await db.collection("user_data").findOne({ userId: "student-2" });
    expect(student1.money).toBe(150);
    expect(student1.exp).toBe(15);
    expect(student2.money).toBe(50);

    const quest = await db
      .collection("quest")
      .findOne({ _id: ObjectId.createFromHexString(created.questId) });
    expect(quest.finished).toEqual(expect.arrayContaining(["student-1", "student-2"]));
  });

  it("history.balance는 클라이언트 값이 아니라 지급 후 서버에서 다시 읽은 잔액을 기록한다", async () => {
    await seedStudent({ userId: "student-1", money: 100 });

    const created = await createQuestService({
      teacher_id: TEACHER_ID,
      classId: CLASS_ID,
      questName: "책 읽기",
      questReward: 30,
    });

    await finishQuestService({
      teacher_id: TEACHER_ID,
      classId: CLASS_ID,
      questData: { _id: created.questId, questReward: 30 },
      rewarded: [{ userId: "student-1" }],
    });

    const history = await db.collection("history").findOne({ userId: "student-1" });
    // 100(기존 잔액) + 30(보상) = 130 이 실제 지급 후 잔액이어야 한다.
    expect(history.balance).toBe(130);
    expect(history.amount).toBe(30);
  });

  it("다른 교사의 teacher_id/classId로는 퀘스트를 지급할 수 없다 (IDOR 방지)", async () => {
    await seedStudent({ userId: "student-1", money: 0 });

    const created = await createQuestService({
      teacher_id: TEACHER_ID,
      classId: CLASS_ID,
      questName: "책 읽기",
      questReward: 50,
    });

    await expect(
      finishQuestService({
        teacher_id: OTHER_TEACHER_ID,
        classId: OTHER_CLASS_ID,
        questData: { _id: created.questId, questReward: 50 },
        rewarded: [{ userId: "student-1" }],
      })
    ).rejects.toThrow("퀘스트를 찾을 수 없거나 권한이 없습니다.");

    const student1 = await db.collection("user_data").findOne({ userId: "student-1" });
    expect(student1.money).toBe(0); // 지급되지 않아야 한다
  });

  it("지급 대상이 비어있으면 에러를 던지고 아무것도 지급하지 않는다", async () => {
    const created = await createQuestService({
      teacher_id: TEACHER_ID,
      classId: CLASS_ID,
      questName: "책 읽기",
      questReward: 50,
    });

    await expect(
      finishQuestService({
        teacher_id: TEACHER_ID,
        classId: CLASS_ID,
        questData: { _id: created.questId, questReward: 50 },
        rewarded: [],
      })
    ).rejects.toThrow("잘못된 요청입니다.");
  });
});
