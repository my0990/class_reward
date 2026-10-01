import { describe, it, expect, vi, beforeEach } from "vitest";
import { compare } from "bcryptjs";
import { setupTestMongo, makeScope, seedClassData } from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const {
  createStudentAccountService,
  checkUniqueNicknameService,
  resetPwdService,
  deleteStudentAccountService,
  DEFAULT_STUDENT_PASSWORD,
} = await import("./account.service.js");

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope();

const users = () => mongo.client.db("user").collection("users");
const userData = () => mongo.db.collection("user_data");
const classData = (s = scope) => mongo.db.collection("class_data").findOne({ teacher_id: s.teacherObjectId, classId: s.classObjectId });

const create = (accountArr, s = scope) =>
  createStudentAccountService({ teacher_id: s.teacher_id, classId: s.classId, accountArr });

beforeEach(async () => {
  await users().deleteMany({}); // setupTestMongo는 "data" DB만 비운다
});

describe("createStudentAccountService (학생 계정 생성)", () => {
  it("별명+번호로 계정을 만들고, 로그인 정보와 학생 데이터를 함께 만든다", async () => {
    await seedClassData(mongo.db, scope, { uniqueNickname: "오렌지", studentAccounts: { 1: false, 2: false, 3: false } });

    const res = await create([1, 3]);

    expect(res).toEqual({ result: true, created: [1, 3], skipped: [] });
    expect((await userData().find().toArray()).map((u) => u.userId).sort()).toEqual(["오렌지1", "오렌지3"]);
    const u1 = await users().findOne({ userId: "오렌지1" });
    expect(await compare(DEFAULT_STUDENT_PASSWORD, u1.passwordHash)).toBe(true);
    expect(u1.teacher_id.toString()).toBe(scope.teacher_id);
    const cd = await classData();
    expect(cd.studentAccounts).toEqual({ 1: "생성됨", 2: false, 3: "생성됨" });
    expect((await userData().findOne({ userId: "오렌지3" })).classNumber).toBe(3);
  });

  it("버튼을 두 번 눌러도(같은 요청 반복) 계정이 두 개 생기지 않는다", async () => {
    await seedClassData(mongo.db, scope, { uniqueNickname: "오렌지" });
    await create([1, 2]);

    const again = await create([1, 2]);

    expect(again).toEqual({ result: true, created: [], skipped: [1, 2] });
    expect(await users().countDocuments()).toBe(2);
    expect(await userData().countDocuments()).toBe(2);
  });

  it("동시에 두 번 요청해도 계정이 한 번만 생긴다", async () => {
    await seedClassData(mongo.db, scope, { uniqueNickname: "오렌지" });

    const results = await Promise.all([create([1, 2, 3]), create([1, 2, 3])]);

    const createdAll = results.flatMap((r) => r.created).sort();
    expect(createdAll).toEqual([1, 2, 3]);
    expect(await users().countDocuments()).toBe(3);
    expect(await userData().countDocuments()).toBe(3);
  });

  it("같은 번호가 요청에 여러 번 들어와도 한 번만 만든다", async () => {
    await seedClassData(mongo.db, scope, { uniqueNickname: "오렌지" });
    const res = await create([5, 5, "5"]);
    expect(res.created).toEqual([5]);
    expect(await users().countDocuments()).toBe(1);
  });

  it("다른 곳에 같은 아이디가 이미 있으면 그 번호는 건너뛴다", async () => {
    await seedClassData(mongo.db, scope, { uniqueNickname: "오렌지" });
    await users().insertOne({ userId: "오렌지2", role: "student", teacher_id: other.teacherObjectId });

    const res = await create([1, 2]);

    expect(res).toEqual({ result: true, created: [1], skipped: [2] });
    expect(await users().countDocuments({ userId: "오렌지2" })).toBe(1);
  });

  it.each([[[0]], [[41]], [[1.5]], [["abc"]], [[]]])("잘못된 번호 %j는 거부한다", async (arr) => {
    await seedClassData(mongo.db, scope, { uniqueNickname: "오렌지" });
    await expect(create(arr)).rejects.toThrow();
    expect(await users().countDocuments()).toBe(0);
  });

  it("고유 별명이 없는 학급은 만들 수 없다", async () => {
    await seedClassData(mongo.db, scope, { uniqueNickname: null });
    await expect(create([1])).rejects.toThrow("고유 별명");
  });

  it("다른 교사의 학급에는 만들 수 없다", async () => {
    await seedClassData(mongo.db, other, { uniqueNickname: "남의반" });
    await expect(create([1], { ...other, teacher_id: scope.teacher_id, teacherObjectId: scope.teacherObjectId })).rejects.toThrow(
      "학급 정보를 찾을 수 없습니다."
    );
  });

  it("삭제한 번호는 다시 만들 수 있다", async () => {
    await seedClassData(mongo.db, scope, { uniqueNickname: "오렌지" });
    await create([1]);
    await deleteStudentAccountService({ teacher_id: scope.teacher_id, classId: scope.classId, student: "오렌지1", classNumber: 1 });

    const res = await create([1]);
    expect(res.created).toEqual([1]);
    expect(await users().countDocuments()).toBe(1);
  });
});

describe("checkUniqueNicknameService (학급 고유 별명 등록)", () => {
  const register = (nick, s = scope) =>
    checkUniqueNicknameService({ teacher_id: s.teacher_id, classId: s.classId, uniqueNickname: nick });

  it("앞뒤 공백을 지우고 등록한다", async () => {
    await seedClassData(mongo.db, scope, { uniqueNickname: null });
    await register("  오렌지  ");
    expect((await classData()).uniqueNickname).toBe("오렌지");
  });

  it.each(["반1", "orange 2", "a", "오렌지!", "", "가나다라마바사아자차카"])("규칙에 맞지 않는 별명 %j는 거부한다", async (nick) => {
    await seedClassData(mongo.db, scope, { uniqueNickname: null });
    await expect(register(nick)).rejects.toThrow();
    expect((await classData()).uniqueNickname).toBeNull();
  });

  it("다른 학급이 쓰는 별명은 쓸 수 없다", async () => {
    await seedClassData(mongo.db, other, { uniqueNickname: "오렌지" });
    await seedClassData(mongo.db, scope, { uniqueNickname: null });
    await expect(register("오렌지")).rejects.toThrow("이미 가입된 계정이에요!");
  });

  it("한 번 정한 별명은 바꿀 수 없다", async () => {
    await seedClassData(mongo.db, scope, { uniqueNickname: "오렌지" });
    await expect(register("사과")).rejects.toThrow("이미 고유 별명이 등록된 학급입니다.");
    expect((await classData()).uniqueNickname).toBe("오렌지");
  });

  it("없는 학급에는 문서를 새로 만들지 않는다", async () => {
    await expect(register("사과", other)).rejects.toThrow("학급 정보를 찾을 수 없습니다.");
    expect(await mongo.db.collection("class_data").countDocuments()).toBe(0);
  });
});

describe("resetPwdService (비밀번호 초기화)", () => {
  it("초기 비밀번호로 되돌린다", async () => {
    await seedClassData(mongo.db, scope, { uniqueNickname: "오렌지" });
    await create([1]);
    await users().updateOne({ userId: "오렌지1" }, { $set: { passwordHash: "changed" } });

    await resetPwdService({ teacher_id: scope.teacher_id, classId: scope.classId, student: "오렌지1" });

    const u = await users().findOne({ userId: "오렌지1" });
    expect(await compare(DEFAULT_STUDENT_PASSWORD, u.passwordHash)).toBe(true);
  });

  it("대상 학생이 없거나 다른 교사의 학생이면 실패를 알린다", async () => {
    await expect(resetPwdService({ teacher_id: scope.teacher_id, classId: scope.classId, student: "없는학생1" })).rejects.toThrow(
      "찾을 수 없거나"
    );
  });
});
