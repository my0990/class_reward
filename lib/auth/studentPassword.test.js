import { describe, it, expect } from "vitest";
import { checkNewStudentPassword, isDefaultStudentPassword, DEFAULT_STUDENT_PASSWORD } from "./studentPassword.js";
import { resolveStudentTarget, StudentTargetError } from "./studentTarget.js";

describe("학생 새 비밀번호 규칙", () => {
  it("4자리 이상, 기본 비밀번호·아이디·같은 글자 반복은 안 됨", () => {
    expect(checkNewStudentPassword("123", "s1")).toMatch(/4자리/);
    expect(checkNewStudentPassword(DEFAULT_STUDENT_PASSWORD, "s1")).toMatch(/처음 비밀번호/);
    expect(checkNewStudentPassword("abcd1", "abcd1")).toMatch(/아이디/);
    expect(checkNewStudentPassword("1111", "s1")).toMatch(/반복/);
    expect(checkNewStudentPassword("x".repeat(21), "s1")).toMatch(/20자리/);
    expect(checkNewStudentPassword("2580", "s1")).toBeNull();
  });

  it("기본 비밀번호 판별", () => {
    expect(isDefaultStudentPassword(DEFAULT_STUDENT_PASSWORD)).toBe(true);
    expect(isDefaultStudentPassword("2580")).toBe(false);
  });

  it("비밀번호를 바꾸기 전 학생 세션은 돈이 오가는 기능을 쓸 수 없다", () => {
    const user = { role: "student", userId: "s1", classId: "c", teacher_id: "t" };
    expect(resolveStudentTarget({ user })).toEqual({ teacher_id: "t", classId: "c", userId: "s1" });
    expect(() => resolveStudentTarget({ user: { ...user, mustChangePassword: true } })).toThrow(StudentTargetError);
  });
});
