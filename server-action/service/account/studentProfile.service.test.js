import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo, makeScope, seedStudent, getStudent } = await import("@/test/helpers/testMongo");
const { updateStudentProfileByTeacherService: update, NICKNAME_MAX, STATE_MAX } = await import("./studentProfile.service.js");

const mongo = setupTestMongo();
const s = makeScope();
const other = makeScope();
const ctx = { teacher_id: s.teacher_id, classId: s.classId };

beforeEach(async () => {
  await seedStudent(mongo.db, s, { userId: "a", profileNickname: "문어", profileState: "안녕" });
  await seedStudent(mongo.db, other, { userId: "x", profileNickname: "다른반" });
});

describe("선생님이 학생 별명·자기소개 고치기", () => {
  it("보낸 칸만 정리해서 고친다", async () => {
    const r = await update({ ...ctx, userId: "a", profileNickname: "  큰  문어 \n" });
    expect(r).toMatchObject({ ok: true, data: { profileNickname: "큰 문어" } });
    let a = await getStudent(mongo.db, "a");
    expect([a.profileNickname, a.profileState]).toEqual(["큰 문어", "안녕"]);

    await update({ ...ctx, userId: "a", profileState: "  첫 줄\r\n둘째 줄  " });
    a = await getStudent(mongo.db, "a");
    expect(a.profileState).toBe("첫 줄\n둘째 줄");
    expect((await update({ ...ctx, userId: "a", profileState: "" })).ok).toBe(true); // 자기소개는 비워도 됨
  });

  it("빈 별명·너무 긴 글·다른 반 학생은 거절", async () => {
    expect((await update({ ...ctx, userId: "a", profileNickname: "   " })).ok).toBe(false);
    expect((await update({ ...ctx, userId: "a", profileNickname: "가".repeat(NICKNAME_MAX + 1) })).ok).toBe(false);
    expect((await update({ ...ctx, userId: "a", profileState: "가".repeat(STATE_MAX + 1) })).ok).toBe(false);
    expect((await update({ ...ctx, userId: "x", profileNickname: "해킹" })).ok).toBe(false);
    expect((await getStudent(mongo.db, "x")).profileNickname).toBe("다른반");
  });
});
