import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import { setupTestMongo, makeScope, seedStudent, seedClassData } from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const {
  softDeleteClassService,
  restoreClassService,
  listDeletedClassesService,
  purgeExpiredClassesService,
  CLASS_TRASH_DAYS,
  MAX_ACTIVE_CLASSES,
} = await import("./deleteClass.service.js");

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope(); // 다른 교사의 학급
const sibling = { ...scope, classObjectId: new ObjectId() }; // 같은 교사의 다른 학급
sibling.classId = sibling.classObjectId.toHexString();

const DAY = 86400000;
const t0 = new Date("2026-10-01T00:00:00Z");
const users = () => mongo.client.db("user").collection("users");
const kiosk = () => mongo.client.db("user").collection("kiosk_pwd_attempts");
const count = (col, f = {}) => mongo.db.collection(col).countDocuments(f);

async function seedFullClass(s, name, prefix) {
  await mongo.db.collection("classes").insertOne({ _id: s.classObjectId, teacher_id: s.teacherObjectId, className: name });
  await seedClassData(mongo.db, s, { className: name });
  for (const n of [1, 2]) {
    const userId = `${prefix}${n}`;
    await seedStudent(mongo.db, s, { userId });
    await users().insertOne({ userId, role: "student", teacher_id: s.teacherObjectId, classId: s.classObjectId });
    await mongo.db.collection("history").insertOne({ userId, teacher_id: s.teacherObjectId, classId: s.classObjectId });
  }
  await mongo.db.collection("history").insertOne({ userId: `${prefix}1`, name: "예전 형식(id 없음)" });
  await mongo.db.collection("quest").insertOne({ teacher_id: s.teacherObjectId, classId: s.classObjectId, questName: "q" });
  await mongo.db.collection("thermometer").insertOne({ teacher_id: s.teacherObjectId, classId: s.classObjectId });
  await kiosk().insertOne({ teacher_id: s.teacherObjectId, userId: `${prefix}1`, failedCount: 2 });
}

beforeEach(async () => {
  await users().deleteMany({});
  await kiosk().deleteMany({});
  await seedFullClass(scope, "6학년 1반", "일반");
  await seedFullClass(sibling, "6학년 2반", "이반");
  await seedFullClass(other, "남의반", "남반");
});

const del = (confirmName = "6학년 1반", now = t0) =>
  softDeleteClassService({ teacher_id: scope.teacher_id, classId: scope.classId, confirmName, now });

describe("softDeleteClassService (학급 휴지통으로)", () => {
  it("학급에 삭제 표시를 하고, 그 학급 학생 로그인을 막는다 (데이터는 아직 그대로)", async () => {
    const res = await del();

    expect(res.studentCount).toBe(2);
    expect(res.purgeAt.getTime()).toBe(t0.getTime() + CLASS_TRASH_DAYS * DAY);
    const cls = await mongo.db.collection("classes").findOne({ _id: scope.classObjectId });
    expect(cls.deletedAt).toEqual(t0);
    expect(await users().countDocuments({ classId: scope.classObjectId, disabled: true })).toBe(2);
    expect(await count("user_data", { classId: scope.classObjectId })).toBe(2);
    // 같은 교사의 다른 학급, 다른 교사 학급은 그대로
    expect(await users().countDocuments({ disabled: true })).toBe(2);
  });

  it("학급 이름이 다르면 거부 (앞뒤 공백은 무시)", async () => {
    await expect(del("6학년 2반")).rejects.toThrow("학급 이름이 일치하지 않습니다.");
    await expect(del("")).rejects.toThrow("학급 이름이 일치하지 않습니다.");
    expect((await del("  6학년 1반  ")).result).toBe(true);
  });

  it("이미 삭제된 학급, 다른 교사의 학급은 거부", async () => {
    await del();
    await expect(del()).rejects.toThrow("이미 삭제된 학급입니다.");
    await expect(
      softDeleteClassService({ teacher_id: scope.teacher_id, classId: other.classId, confirmName: "남의반" })
    ).rejects.toThrow("학급 정보를 찾을 수 없습니다.");
  });
});

describe("restoreClassService (복구)", () => {
  it("30일 안에는 복구되고 학생 로그인도 다시 된다", async () => {
    await del();
    await restoreClassService({ teacher_id: scope.teacher_id, classId: scope.classId, now: new Date(t0.getTime() + 10 * DAY) });

    const cls = await mongo.db.collection("classes").findOne({ _id: scope.classObjectId });
    expect(cls.deletedAt).toBeUndefined();
    expect(await users().countDocuments({ disabled: true })).toBe(0);
  });

  it("보관 기간이 지났으면 복구할 수 없다", async () => {
    await del();
    await expect(
      restoreClassService({ teacher_id: scope.teacher_id, classId: scope.classId, now: new Date(t0.getTime() + 31 * DAY) })
    ).rejects.toThrow("보관 기간");
  });

  it("활성 학급이 이미 최대 개수면 복구할 수 없다", async () => {
    await del();
    await mongo.db
      .collection("classes")
      .insertMany(Array.from({ length: MAX_ACTIVE_CLASSES - 1 }, (_, i) => ({ teacher_id: scope.teacherObjectId, className: `x${i}` })));
    await expect(restoreClassService({ teacher_id: scope.teacher_id, classId: scope.classId, now: t0 })).rejects.toThrow("최대");
  });

  it("삭제되지 않은 학급은 복구 대상이 아니다", async () => {
    await expect(restoreClassService({ teacher_id: scope.teacher_id, classId: scope.classId })).rejects.toThrow("삭제된 학급이 아닙니다.");
  });
});

describe("listDeletedClassesService (휴지통 목록)", () => {
  it("이 교사의 삭제된 학급만 학생 수와 함께 준다", async () => {
    await del();
    const list = await listDeletedClassesService({ teacher_id: scope.teacher_id });
    expect(list.map((c) => [c.className, c.studentsCount])).toEqual([["6학년 1반", 2]]);
  });
});

describe("purgeExpiredClassesService (30일 뒤 영구 삭제)", () => {
  it("보관 기간 전에는 지우지 않는다", async () => {
    await del();
    const r = await purgeExpiredClassesService({ teacher_id: scope.teacher_id, now: new Date(t0.getTime() + 29 * DAY) });
    expect(r.purged).toBe(0);
    expect(await count("classes", { _id: scope.classObjectId })).toBe(1);
  });

  it("보관 기간이 지나면 학급에 딸린 데이터를 모두 지우고, 다른 학급은 그대로 둔다", async () => {
    await del();
    const r = await purgeExpiredClassesService({ now: new Date(t0.getTime() + 31 * DAY) });
    expect(r.purged).toBe(1);

    const c = scope.classObjectId;
    expect(await count("classes", { _id: c })).toBe(0);
    expect(await count("class_data", { classId: c })).toBe(0);
    expect(await count("user_data", { classId: c })).toBe(0);
    expect(await users().countDocuments({ classId: c })).toBe(0);
    expect(await count("history", { userId: { $in: ["일반1", "일반2"] } })).toBe(0); // 예전 형식 포함
    expect(await count("quest", { classId: c })).toBe(0);
    expect(await count("thermometer", { classId: c })).toBe(0);
    expect(await kiosk().countDocuments({ userId: "일반1" })).toBe(0);

    // 같은 교사의 다른 학급, 다른 교사 학급은 그대로
    expect(await count("user_data", { classId: sibling.classObjectId })).toBe(2);
    expect(await count("history", { userId: "이반1" })).toBe(2);
    expect(await count("user_data", { classId: other.classObjectId })).toBe(2);
    expect(await users().countDocuments()).toBe(4);
  });
});
