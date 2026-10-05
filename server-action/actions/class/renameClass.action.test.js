import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import { setupTestMongo, makeScope, seedClassData } from "@/test/helpers/testMongo";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));
vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const { getServerSession } = await import("next-auth");
const { renameClass } = await import("./renameClass.action.js");
const { normalizeClassName, CLASS_NAME_MAX } = await import("@/server-action/service/class/renameClass.service.js");

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope();

const asTeacher = (s = scope) => getServerSession.mockResolvedValue({ user: { role: "teacher", _id: s.teacher_id } });
const names = async (s = scope) => ({
  classes: (await mongo.db.collection("classes").findOne({ _id: s.classObjectId })).className,
  classData: (await mongo.db.collection("class_data").findOne({ classId: s.classObjectId })).className,
});

beforeEach(async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  getServerSession.mockReset();
  for (const s of [scope, other]) {
    await mongo.db.collection("classes").insertOne({ _id: s.classObjectId, teacher_id: s.teacherObjectId, className: "6학년 1반" });
    await seedClassData(mongo.db, s, { className: "6학년 1반" });
  }
});

describe("학급 이름 바꾸기", () => {
  it("classes와 class_data 둘 다 바뀌고, 공백은 정리된다", async () => {
    asTeacher();
    const res = await renameClass({ classId: scope.classId, className: "  6학년   2반 " });
    expect(res).toMatchObject({ result: true, data: { className: "6학년 2반" } });
    expect(await names()).toEqual({ classes: "6학년 2반", classData: "6학년 2반" });
  });

  it("빈 이름, 너무 긴 이름은 거부", async () => {
    asTeacher();
    expect((await renameClass({ classId: scope.classId, className: "   " })).result).toBe(false);
    expect((await renameClass({ classId: scope.classId, className: "가".repeat(CLASS_NAME_MAX + 1) })).result).toBe(false);
    expect(await names()).toEqual({ classes: "6학년 1반", classData: "6학년 1반" });
  });

  it("남의 학급, 학생 세션, 휴지통 학급은 바꿀 수 없다", async () => {
    asTeacher();
    expect((await renameClass({ classId: other.classId, className: "해킹" })).result).toBe(false);
    expect((await names(other)).classes).toBe("6학년 1반");

    getServerSession.mockResolvedValue({
      user: { role: "student", _id: new ObjectId().toHexString(), teacher_id: scope.teacher_id, classId: scope.classId },
    });
    expect((await renameClass({ classId: scope.classId, className: "해킹" })).result).toBe(false);

    asTeacher();
    await mongo.db.collection("classes").updateOne({ _id: scope.classObjectId }, { $set: { deletedAt: new Date() } });
    expect((await renameClass({ classId: scope.classId, className: "새 이름" })).result).toBe(false);
    expect(await names()).toEqual({ classes: "6학년 1반", classData: "6학년 1반" });
  });

  it("normalizeClassName", () => {
    expect(normalizeClassName(" a  b ")).toEqual({ name: "a b" });
    expect(normalizeClassName(undefined).error).toBeTruthy();
    expect(normalizeClassName("가".repeat(CLASS_NAME_MAX)).name).toHaveLength(CLASS_NAME_MAX);
  });
});
