import { describe, it, expect, vi, beforeEach } from "vitest";
import { hash, compare } from "bcryptjs";
import { setupTestMongo, makeScope } from "@/test/helpers/testMongo";
import { DEFAULT_STUDENT_PASSWORD } from "@/lib/auth/studentPassword";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { changeDefaultStudentPasswordService } = await import("./studentPassword.service.js");
const { verifyStudentPasswordService } = await import("@/server-action/service/kiosk/kioskAuth.service.js");

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope();
const users = () => mongo.client.db("user").collection("users");

beforeEach(async () => {
  await users().deleteMany({});
  await mongo.client.db("user").collection("kiosk_pwd_attempts").deleteMany({});
  await users().insertMany([
    { userId: "s1", role: "student", teacher_id: scope.teacherObjectId, classId: scope.classObjectId, passwordHash: await hash(DEFAULT_STUDENT_PASSWORD, 4) },
    { userId: "s2", role: "student", teacher_id: scope.teacherObjectId, classId: scope.classObjectId, passwordHash: await hash("2580", 4) },
  ]);
});

const hashOf = async (userId) => (await users().findOne({ userId })).passwordHash;

describe("학생 기본 비밀번호 바꾸기", () => {
  it("키오스크: 기본 비밀번호로 맞히면 mustChangePassword, 직접 바꾼 비밀번호면 false", async () => {
    const a = await verifyStudentPasswordService({ teacher_id: scope.teacher_id, userId: "s1", userPwd: DEFAULT_STUDENT_PASSWORD });
    const b = await verifyStudentPasswordService({ teacher_id: scope.teacher_id, userId: "s2", userPwd: "2580" });
    expect(a).toMatchObject({ ok: true, mustChangePassword: true });
    expect(b).toMatchObject({ ok: true, mustChangePassword: false });
  });

  it("기본 비밀번호인 학생은 새 비밀번호로 바뀐다", async () => {
    expect(await changeDefaultStudentPasswordService({ teacher_id: scope.teacher_id, userId: "s1", newPassword: "4826" })).toEqual({ ok: true });
    expect(await compare("4826", await hashOf("s1"))).toBe(true);
  });

  it("규칙에 안 맞거나, 이미 바꾼 학생이거나, 다른 교사의 학생이면 거부", async () => {
    expect((await changeDefaultStudentPasswordService({ teacher_id: scope.teacher_id, userId: "s1", newPassword: "12" })).ok).toBe(false);
    expect((await changeDefaultStudentPasswordService({ teacher_id: scope.teacher_id, userId: "s2", newPassword: "9999x" })).ok).toBe(false);
    expect((await changeDefaultStudentPasswordService({ teacher_id: other.teacher_id, userId: "s1", newPassword: "4826" })).ok).toBe(false);
    expect(await compare(DEFAULT_STUDENT_PASSWORD, await hashOf("s1"))).toBe(true);
    expect(await compare("2580", await hashOf("s2"))).toBe(true);
  });
});
