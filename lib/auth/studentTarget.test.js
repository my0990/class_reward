import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = "test-secret";
});

const { createKioskToken } = await import("./kioskToken.js");
const { resolveStudentTarget, StudentTargetError } = await import("./studentTarget.js");

const teacherSession = { user: { role: "teacher", _id: "t1" } };
const studentSession = { user: { role: "student", _id: "x", userId: "s1", classId: "c1", teacher_id: "t1" } };

describe("resolveStudentTarget", () => {
  it("학생 로그인이면 파라미터와 상관없이 본인만 대상이 된다", () => {
    expect(resolveStudentTarget(studentSession, { userId: "someone-else", classId: "c9" })).toEqual({
      teacher_id: "t1",
      classId: "c1",
      userId: "s1",
    });
  });

  it("교사 키오스크: 그 학생의 유효한 토큰이 있으면 통과", () => {
    const kioskToken = createKioskToken({ teacher_id: "t1", classId: "c1", userId: "s1" });
    expect(resolveStudentTarget(teacherSession, { userId: "s1", classId: "c1", kioskToken })).toEqual({
      teacher_id: "t1",
      classId: "c1",
      userId: "s1",
    });
  });

  it("교사 키오스크: 토큰이 없으면 거부 (비밀번호 없이 결제 불가)", () => {
    expect(() => resolveStudentTarget(teacherSession, { userId: "s1", classId: "c1" })).toThrow(
      "학생 비밀번호 확인이 필요합니다"
    );
  });

  it("교사 키오스크: 다른 학생의 토큰으로는 거부", () => {
    const kioskToken = createKioskToken({ teacher_id: "t1", classId: "c1", userId: "s2" });
    expect(() => resolveStudentTarget(teacherSession, { userId: "s1", classId: "c1", kioskToken })).toThrow(
      StudentTargetError
    );
  });

  it("교사 키오스크: userId/classId가 없으면 거부", () => {
    expect(() => resolveStudentTarget(teacherSession, {})).toThrow("잘못된 요청입니다.");
  });

  it("로그인 안 했으면 거부", () => {
    expect(() => resolveStudentTarget(null, { userId: "s1", classId: "c1" })).toThrow("로그인이 필요합니다.");
  });

  it("키오스크 기기: 연결된 반 학생의 유효한 토큰만 통과", () => {
    const kiosk = { user: { role: "kiosk", _id: "d1", teacher_id: "t1", classId: "c1" } };
    const kioskToken = createKioskToken({ teacher_id: "t1", classId: "c1", userId: "s1" });
    expect(resolveStudentTarget(kiosk, { userId: "s1", classId: "c1", kioskToken })).toEqual({ teacher_id: "t1", classId: "c1", userId: "s1" });
    // 다른 반 (같은 선생님이어도)
    const otherClassToken = createKioskToken({ teacher_id: "t1", classId: "c2", userId: "s9" });
    expect(() => resolveStudentTarget(kiosk, { userId: "s9", classId: "c2", kioskToken: otherClassToken })).toThrow(StudentTargetError);
    // 토큰 없음
    expect(() => resolveStudentTarget(kiosk, { userId: "s1", classId: "c1" })).toThrow(StudentTargetError);
  });
});
