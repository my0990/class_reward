import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import { setupTestMongo, makeScope } from "@/test/helpers/testMongo";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));
vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const { getServerSession } = await import("next-auth");
const { getTeacherId, authorizeTeacherClass, NOT_TEACHER_MESSAGE, NOT_OWNER_MESSAGE } = await import("./actionAuth.js");

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope();

const asTeacher = (s = scope) => getServerSession.mockResolvedValue({ user: { role: "teacher", _id: s.teacher_id } });
const asStudent = () =>
  getServerSession.mockResolvedValue({
    user: { role: "student", _id: new ObjectId().toHexString(), userId: "s1", teacher_id: scope.teacher_id, classId: scope.classId },
  });

async function seedClass(s) {
  await mongo.db.collection("classes").insertOne({ _id: s.classObjectId, teacher_id: s.teacherObjectId, className: "반" });
}

beforeEach(() => getServerSession.mockReset());

describe("getTeacherId", () => {
  it("교사면 교사 id", async () => {
    asTeacher();
    expect(await getTeacherId()).toBe(scope.teacher_id);
  });

  it("학생이거나 로그인 안 했으면 null", async () => {
    asStudent();
    expect(await getTeacherId()).toBeNull();
    getServerSession.mockResolvedValue(null);
    expect(await getTeacherId()).toBeNull();
  });
});

describe("authorizeTeacherClass", () => {
  it("교사 + 내 학급이면 통과", async () => {
    await seedClass(scope);
    asTeacher();
    expect(await authorizeTeacherClass(scope.classId)).toEqual({ ok: true, teacher_id: scope.teacher_id });
  });

  it("학생이면 거부", async () => {
    await seedClass(scope);
    asStudent();
    expect(await authorizeTeacherClass(scope.classId)).toEqual({ ok: false, message: NOT_TEACHER_MESSAGE });
  });

  it("다른 교사의 학급이면 거부", async () => {
    await seedClass(other);
    asTeacher();
    expect(await authorizeTeacherClass(other.classId)).toEqual({ ok: false, message: NOT_OWNER_MESSAGE });
  });

  it.each([undefined, "", "abc", "123456789012"])("classId가 %j이면 거부", async (classId) => {
    asTeacher();
    expect((await authorizeTeacherClass(classId)).ok).toBe(false);
  });
});
