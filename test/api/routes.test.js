// app/api 조회 라우트 테스트: 권한(401/403), 잘못된 id(400), 다른 반/다른 교사 데이터 차단
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import { setupTestMongo, makeScope, seedStudent, seedClassData } from "@/test/helpers/testMongo";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));
vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const { getServerSession } = await import("next-auth");
const classesRoute = await import("@/app/api/classes/route.js");
const classDataRoute = await import("@/app/api/classData/[id]/route.js");
const studentsRoute = await import("@/app/api/students/[id]/route.js");
const questRoute = await import("@/app/api/fetchQuestList/[id]/route.js");
const historyRoute = await import("@/app/api/fetchHistory/[id]/route.js");
const thermometerRoute = await import("@/app/api/thermometer/[id]/route.js");
const userRoute = await import("@/app/api/user/route.js");
const noticesRoute = await import("@/app/api/notices/route.js");
const noticeRoute = await import("@/app/api/notices/[id]/route.js");

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope();

// ---- 세션 흉내 ----
const asTeacher = (s = scope, email = "teacher@test.com") =>
  getServerSession.mockResolvedValue({ user: { role: "teacher", _id: s.teacher_id, email } });
const asStudent = (userId = "s1", s = scope) =>
  getServerSession.mockResolvedValue({
    user: { role: "student", _id: new ObjectId().toHexString(), userId, teacher_id: s.teacher_id, classId: s.classId },
  });
const asGuest = () => getServerSession.mockResolvedValue(null);

async function call(route, { id, url = "http://localhost/api/test" } = {}) {
  const res = await route.GET(new Request(url), { params: Promise.resolve({ id }) });
  return { status: res.status, body: await res.json() };
}

// 학급 문서(classes) — 학급 조회 API는 휴지통에 없는 학급만 허용한다
async function seedClassDocs(...scopes) {
  for (const sc of scopes) {
    await mongo.db.collection("classes").insertOne({ _id: sc.classObjectId, teacher_id: sc.teacherObjectId, className: "반" });
  }
}

beforeEach(() => {
  getServerSession.mockReset();
});

describe("공통: 로그인/권한/잘못된 id", () => {
  const teacherOnly = [
    ["classes", classesRoute],
    ["students", studentsRoute],
    ["fetchQuestList", questRoute],
    ["fetchHistory", historyRoute],
  ];
  const needsLogin = [...teacherOnly, ["classData", classDataRoute], ["thermometer", thermometerRoute], ["user", userRoute]];

  it.each(needsLogin)("%s: 로그인 안 하면 401", async (_, route) => {
    asGuest();
    const { status, body } = await call(route, { id: scope.classId });
    expect(status).toBe(401);
    expect(body.error).toBe("로그인이 필요합니다.");
  });

  it.each(teacherOnly)("%s: 학생이면 403", async (_, route) => {
    asStudent();
    const { status } = await call(route, { id: scope.classId });
    expect(status).toBe(403);
  });

  it.each([
    ["classData", classDataRoute],
    ["students", studentsRoute],
    ["fetchQuestList", questRoute],
    ["thermometer", thermometerRoute],
  ])("%s: 잘못된 id면 500이 아니라 400", async (_, route) => {
    asTeacher();
    for (const id of ["abc", "123456789012", "zzzzzzzzzzzzzzzzzzzzzzzz"]) {
      const { status } = await call(route, { id });
      expect(status).toBe(400);
    }
  });
});

describe("/api/classes", () => {
  it("로그인한 교사의 학급만 준다", async () => {
    await mongo.db.collection("classes").insertMany([
      { teacher_id: scope.teacherObjectId, className: "우리반" },
      { teacher_id: other.teacherObjectId, className: "남의반" },
    ]);
    asTeacher();
    const { status, body } = await call(classesRoute);
    expect(status).toBe(200);
    expect(body.map((c) => c.className)).toEqual(["우리반"]);
  });
});

describe("/api/classes 학생 수", () => {
  it("학급별 학생 수를 세서 준다 (저장된 studentsCount는 무시)", async () => {
    const classA = new ObjectId();
    const classB = new ObjectId();
    await mongo.db.collection("classes").insertMany([
      { _id: classA, teacher_id: scope.teacherObjectId, className: "1반", studentsCount: 0 },
      { _id: classB, teacher_id: scope.teacherObjectId, className: "2반", studentsCount: 99 },
    ]);
    const inA = { ...scope, classObjectId: classA };
    await seedStudent(mongo.db, inA, { userId: "a1" });
    await seedStudent(mongo.db, inA, { userId: "a2" });
    await seedStudent(mongo.db, inA, { userId: "a3" });
    // 다른 교사의 학생, 교사 본인 데이터는 세지 않는다
    await seedStudent(mongo.db, { ...other, classObjectId: classA }, { userId: "x1" });
    await mongo.db.collection("user_data").insertOne({ userId: "t@test.com", role: "teacher", teacher_id: scope.teacherObjectId, classId: classA });

    asTeacher();
    const { body } = await call(classesRoute);
    const byName = Object.fromEntries(body.map((c) => [c.className, c.studentsCount]));
    expect(byName).toEqual({ "1반": 3, "2반": 0 });
  });
});

describe("/api/classData/[id]", () => {
  beforeEach(() => seedClassDocs(scope, other));

  it("교사: 자기 학급 정보를 준다", async () => {
    await seedClassData(mongo.db, scope, { className: "우리반" });
    asTeacher();
    const { status, body } = await call(classDataRoute, { id: scope.classId });
    expect(status).toBe(200);
    expect(body.className).toBe("우리반");
  });

  it("교사: 다른 교사의 학급은 404", async () => {
    await seedClassData(mongo.db, other);
    asTeacher();
    const { status } = await call(classDataRoute, { id: other.classId });
    expect(status).toBe(404);
  });

  it("학생: 자기 학급 정보는 볼 수 있다", async () => {
    await seedClassData(mongo.db, scope, { className: "우리반" });
    asStudent("s1");
    const { status, body } = await call(classDataRoute, { id: scope.classId });
    expect(status).toBe(200);
    expect(body.className).toBe("우리반");
  });

  it("학생: 같은 선생님의 다른 반은 403", async () => {
    const sameTeacherOtherClass = { ...scope, classObjectId: new ObjectId() };
    sameTeacherOtherClass.classId = sameTeacherOtherClass.classObjectId.toHexString();
    await seedClassData(mongo.db, sameTeacherOtherClass);
    asStudent("s1");
    const { status } = await call(classDataRoute, { id: sameTeacherOtherClass.classId });
    expect(status).toBe(403);
  });
});

describe("/api/students/[id]", () => {
  beforeEach(() => seedClassDocs(scope, other));

  it("교사: 자기 학급 학생만 번호순으로 준다", async () => {
    await seedStudent(mongo.db, scope, { userId: "s2", classNumber: 2 });
    await seedStudent(mongo.db, scope, { userId: "s1", classNumber: 1 });
    await seedStudent(mongo.db, other, { userId: "outsider", classNumber: 1 });
    asTeacher();
    const { body } = await call(studentsRoute, { id: scope.classId });
    expect(body.map((s) => s.userId)).toEqual(["s1", "s2"]);
  });

  it("교사: 다른 교사의 학급 id로는 404 (학생 목록을 주지 않음)", async () => {
    await seedStudent(mongo.db, other, { userId: "outsider" });
    asTeacher();
    const { status, body } = await call(studentsRoute, { id: other.classId });
    expect(status).toBe(404);
    expect(body.error).toBe("학급 정보를 찾을 수 없습니다.");
  });
});

describe("/api/fetchQuestList/[id]", () => {
  beforeEach(() => seedClassDocs(scope, other));

  it("교사: 자기 학급 퀘스트만 준다", async () => {
    await mongo.db.collection("quest").insertMany([
      { teacher_id: scope.teacherObjectId, classId: scope.classObjectId, questName: "우리 퀘스트", time: 1 },
      { teacher_id: other.teacherObjectId, classId: scope.classObjectId, questName: "남의 퀘스트", time: 2 },
    ]);
    asTeacher();
    const { body } = await call(questRoute, { id: scope.classId });
    expect(body.map((q) => q.questName)).toEqual(["우리 퀘스트"]);
  });
});

describe("/api/fetchHistory/[id]", () => {
  it("담임 교사는 학생 거래 내역을 최신순으로 본다", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1" });
    await mongo.db.collection("history").insertMany([
      { userId: "s1", name: "old", date: new Date("2026-01-01") },
      { userId: "s1", name: "new", date: new Date("2026-02-01") },
    ]);
    asTeacher();
    const { status, body } = await call(historyRoute, { id: "s1" });
    expect(status).toBe(200);
    expect(body.map((h) => h.name)).toEqual(["new", "old"]);
  });

  it("기본 50건, limit으로 늘릴 수 있고 최대 500건", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1" });
    await mongo.db.collection("history").insertMany(
      Array.from({ length: 520 }, (_, i) => ({ userId: "s1", name: `h${i}`, date: new Date(2026, 8, 1, 0, 0, i) }))
    );
    asTeacher();
    const base = "http://localhost/api/fetchHistory/s1";
    expect((await call(historyRoute, { id: "s1", url: base })).body).toHaveLength(50);
    const page2 = (await call(historyRoute, { id: "s1", url: `${base}?limit=100` })).body;
    expect(page2).toHaveLength(100);
    expect(page2[0].name).toBe("h519"); // 최신순
    expect((await call(historyRoute, { id: "s1", url: `${base}?limit=99999` })).body).toHaveLength(500);
    expect((await call(historyRoute, { id: "s1", url: `${base}?limit=abc` })).body).toHaveLength(50);
  });

  it("다른 교사의 학생 내역은 403", async () => {
    await seedStudent(mongo.db, other, { userId: "outsider" });
    asTeacher();
    const { status } = await call(historyRoute, { id: "outsider" });
    expect(status).toBe(403);
  });
});

describe("/api/thermometer/[id]", () => {
  beforeEach(() => seedClassDocs(scope, other));

  it("설정이 없으면 기본값을 준다", async () => {
    asTeacher();
    const { status, body } = await call(thermometerRoute, { id: scope.classId });
    expect(status).toBe(200);
    expect(body.isDefault).toBe(true);
    expect(body.requireCurrency).toBe(30);
  });

  it("저장된 값과 기본값을 합쳐서 준다", async () => {
    await mongo.db.collection("thermometer").insertOne({
      teacher_id: scope.teacherObjectId,
      classId: scope.classObjectId,
      requireCurrency: 10,
      reward: { 10: "간식" },
    });
    asStudent("s1");
    const { body } = await call(thermometerRoute, { id: scope.classId });
    expect(body.requireCurrency).toBe(10);
    expect(body.reward["10"]).toBe("간식");
    expect(body.reward["20"]).toBe("");
    expect(body.isDefault).toBeUndefined();
  });

  it("학생: 다른 반 온도계는 403", async () => {
    asStudent("s1");
    const { status } = await call(thermometerRoute, { id: other.classId });
    expect(status).toBe(403);
  });
});

describe("/api/user", () => {
  it("학생: 자기 정보를 준다", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", money: 42 });
    asStudent("s1");
    const { status, body } = await call(userRoute);
    expect(status).toBe(200);
    expect(body.money).toBe(42);
  });

  it("학생: 세션의 학급과 다른 학급에 같은 userId가 있어도 섞이지 않는다", async () => {
    await seedStudent(mongo.db, other, { userId: "s1", money: 999 });
    asStudent("s1");
    const { status } = await call(userRoute);
    expect(status).toBe(404);
  });

  it("교사: 이메일로 저장된 자기 정보를 준다", async () => {
    await mongo.db.collection("user_data").insertOne({ userId: "teacher@test.com", role: "teacher" });
    asTeacher(scope, "teacher@test.com");
    const { status, body } = await call(userRoute);
    expect(status).toBe(200);
    expect(body.role).toBe("teacher");
  });
});

describe("/api/notices (로그인 불필요)", () => {
  async function seedNotices(n) {
    await mongo.client.db("admins").collection("notices").deleteMany({});
    await mongo.client
      .db("admins")
      .collection("notices")
      .insertMany(Array.from({ length: n }, (_, i) => ({ title: `공지${i}`, createdAt: new Date(2026, 0, i + 1) })));
  }

  it("limit은 최대 50개로 제한된다", async () => {
    await seedNotices(60);
    const { body } = await call(noticesRoute, { url: "http://localhost/api/notices?limit=100000" });
    expect(body.notices).toHaveLength(50);
    expect(body.total).toBe(60);
  });

  it("page/limit이 숫자가 아니면 기본값(1페이지, 5개)으로 처리한다", async () => {
    await seedNotices(7);
    const { status, body } = await call(noticesRoute, { url: "http://localhost/api/notices?page=abc&limit=xyz" });
    expect(status).toBe(200);
    expect(body.page).toBe(1);
    expect(body.notices).toHaveLength(5);
  });

  it("공지 상세: 잘못된 id는 400, 없는 id는 404", async () => {
    expect((await call(noticeRoute, { id: "123456789012" })).status).toBe(400);
    expect((await call(noticeRoute, { id: new ObjectId().toHexString() })).status).toBe(404);
  });
});

describe("휴지통(삭제된) 학급", () => {
  it("학급 목록에서 숨겨지고, 학급 조회 API는 404", async () => {
    await mongo.db.collection("classes").insertMany([
      { _id: scope.classObjectId, teacher_id: scope.teacherObjectId, className: "삭제된반", deletedAt: new Date(), purgeAt: new Date(Date.now() + 86400000) },
      { teacher_id: scope.teacherObjectId, className: "남은반" },
    ]);
    await seedClassData(mongo.db, scope);
    asTeacher();
    expect((await call(classesRoute)).body.map((c) => c.className)).toEqual(["남은반"]);
    for (const route of [classDataRoute, studentsRoute, questRoute, thermometerRoute]) {
      const { status, body } = await call(route, { id: scope.classId });
      expect(status).toBe(404);
      expect(body.error).toBe("삭제된 학급입니다.");
    }
  });
});
