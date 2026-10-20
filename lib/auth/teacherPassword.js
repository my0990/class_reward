// 중요한 작업(학급 삭제 등) 전에 교사 비밀번호를 한 번 더 확인한다.
// 키오스크처럼 교사 계정으로 로그인된 채 교실에 켜 둔 기기에서 학생이 선생님 화면에 들어가도,
// 비밀번호를 모르면 되돌리기 어려운 작업은 할 수 없게 한다.
// 5번 틀리면 10분 동안 잠근다 (로그인 잠금과는 따로 센다: key "confirm:<교사 id>").
import { compare } from "bcryptjs";
import { assertNotLocked, recordLoginFailure, clearLoginFailures, LoginLockedError } from "@/lib/auth/loginLimit";

/** @returns {Promise<{ ok: true } | { ok: false, message: string }>} */
export async function verifyTeacherPassword(userDb, teacherObjectId, password, now = new Date()) {
  if (!password) return { ok: false, message: "비밀번호를 입력해주세요." };
  const key = `confirm:${String(teacherObjectId)}`;
  try {
    await assertNotLocked(userDb, key, now);
    const teacher = await userDb
      .collection("users")
      .findOne({ _id: teacherObjectId, role: "teacher" }, { projection: { passwordHash: 1, password: 1 } });
    const hashed = teacher?.passwordHash ?? teacher?.password;
    if (!hashed || !(await compare(String(password), hashed))) {
      await recordLoginFailure(userDb, key, now);
      return { ok: false, message: "비밀번호가 일치하지 않습니다." };
    }
    await clearLoginFailures(userDb, key);
    return { ok: true };
  } catch (error) {
    if (error instanceof LoginLockedError) return { ok: false, message: error.message };
    throw error;
  }
}
