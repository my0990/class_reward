import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import { hash } from "bcryptjs";
import { setupTestMongo, makeScope, seedStudent, seedClassData } from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const { withdrawTeacherService, getWithdrawSummaryService, WITHDRAW_CONFIRM_TEXT } = await import("./withdraw.service.js");

const mongo = setupTestMongo();
const me = makeScope();
const myTrashed = { ...me, classObjectId: new ObjectId() }; // 휴지통에 있는 내 학급
myTrashed.classId = myTrashed.classObjectId.toHexString();
const other = makeScope(); // 다른 교사

const PASSWORD = "teacher-pw-1";
const users = () => mongo.client.db("user").collection("users");
const count = (col, f) => mongo.db.collection(col).countDocuments(f);

async function seedTeacher(s, email) {
  await users().insertOne({ _id: s.teacherObjectId, role: "teacher", email, passwordHash: await hash(PASSWORD, 4) });
  await mongo.db.collection("user_data").insertOne({ userId: email, role: "teacher", money: 0 });
  await mongo.client.db("user").collection("email_verifications").insertOne({ email });
  await mongo.client.db("user").collection("email_send_log").insertOne({ email, sentAt: new Date() });
}

async function seedClass(s, prefix, extra = {}) {
  await mongo.db.collection("classes").insertOne({ _id: s.classObjectId, teacher_id: s.teacherObjectId, className: "반", ...extra });
  await seedClassData(mongo.db, s);
  for (const n of [1, 2]) {
    const userId = `${prefix}${n}`;
    await seedStudent(mongo.db, s, { userId });
    await users().insertOne({ userId, role: "student", teacher_id: s.teacherObjectId, classId: s.classObjectId });
    await mongo.db.collection("history").insertOne({ userId, teacher_id: s.teacherObjectId, classId: s.classObjectId });
  }
  await mongo.db.collection("quest").insertOne({ teacher_id: s.teacherObjectId, classId: s.classObjectId });
  await mongo.db.collection("thermometer").insertOne({ teacher_id: s.teacherObjectId, classId: s.classObjectId });
}

beforeEach(async () => {
  for (const name of ["user", "admins"]) {
    const db = mongo.client.db(name);
    await Promise.all((await db.collections()).map((c) => c.deleteMany({})));
  }
  await seedTeacher(me, "me@test.com");
  await seedTeacher(other, "other@test.com");
  await seedClass(me, "a");
  await seedClass(myTrashed, "b", { deletedAt: new Date(), purgeAt: new Date() });
  await seedClass(other, "c");
});

describe("교사 회원 탈퇴", () => {
  it("확인 창 개수: 휴지통 학급 포함", async () => {
    expect(await getWithdrawSummaryService({ teacher_id: me.teacher_id })).toEqual({ classes: 2, students: 4 });
  });

  it("확인 문구나 비밀번호가 틀리면 아무것도 지우지 않는다", async () => {
    expect((await withdrawTeacherService({ teacher_id: me.teacher_id, password: PASSWORD, confirmText: "탈퇴" })).ok).toBe(false);
    expect((await withdrawTeacherService({ teacher_id: me.teacher_id, password: "wrong", confirmText: WITHDRAW_CONFIRM_TEXT })).ok).toBe(false);
    expect(await users().countDocuments({ teacher_id: me.teacherObjectId })).toBe(4);
    expect(await users().countDocuments({ _id: me.teacherObjectId, disabled: true })).toBe(0);
    expect(await count("classes", { teacher_id: me.teacherObjectId })).toBe(2);
  });

  it("내 계정과 모든 학급 데이터가 지워지고, 다른 교사 데이터는 그대로", async () => {
    const res = await withdrawTeacherService({ teacher_id: me.teacher_id, password: PASSWORD, confirmText: ` ${WITHDRAW_CONFIRM_TEXT} ` });
    expect(res.ok).toBe(true);

    // 내 것: 전부 없음
    expect(await users().countDocuments({ $or: [{ _id: me.teacherObjectId }, { teacher_id: me.teacherObjectId }] })).toBe(0);
    for (const col of ["classes", "class_data", "user_data", "history", "quest", "thermometer"]) {
      expect(await count(col, { teacher_id: me.teacherObjectId })).toBe(0);
    }
    expect(await count("user_data", { userId: "me@test.com" })).toBe(0);
    expect(await mongo.client.db("user").collection("email_verifications").countDocuments({ email: "me@test.com" })).toBe(0);
    expect(await mongo.client.db("user").collection("email_send_log").countDocuments({ email: "me@test.com" })).toBe(0);

    // 다른 교사: 그대로
    expect(await users().countDocuments({ $or: [{ _id: other.teacherObjectId }, { teacher_id: other.teacherObjectId }] })).toBe(3);
    expect(await count("classes", { teacher_id: other.teacherObjectId })).toBe(1);
    expect(await count("history", { teacher_id: other.teacherObjectId })).toBe(2);
    expect(await count("user_data", { userId: "other@test.com" })).toBe(1);
    expect(await mongo.client.db("user").collection("email_verifications").countDocuments({ email: "other@test.com" })).toBe(1);

    // 관리자 기록: 개인정보 없이 1건
    const logs = await mongo.client.db("admins").collection("audit_log").find({ action: "teacher_withdraw" }).toArray();
    expect(logs).toHaveLength(1);
    expect(JSON.stringify(logs[0])).not.toContain("me@test.com");
  });

  it("교사가 아닌 계정(학생 id)으로는 탈퇴되지 않는다", async () => {
    const student = await users().findOne({ userId: "a1" });
    const res = await withdrawTeacherService({ teacher_id: student._id.toHexString(), password: PASSWORD, confirmText: WITHDRAW_CONFIRM_TEXT });
    expect(res.ok).toBe(false);
    expect(await users().countDocuments({ teacher_id: me.teacherObjectId })).toBe(4);
  });
});
