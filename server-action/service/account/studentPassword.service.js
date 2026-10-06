// 학생 비밀번호 바꾸기 (기본 비밀번호 → 새 비밀번호)
// - 학생 본인 로그인: changeDefaultStudentPasswordService (첫 로그인 강제 변경 화면)
// - 키오스크: 비밀번호 확인 토큰을 받은 뒤 같은 서비스로 바꾼다
import { ObjectId } from "mongodb";
import { compare, hash } from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { checkNewStudentPassword, DEFAULT_STUDENT_PASSWORD } from "@/lib/auth/studentPassword";

/**
 * 지금 비밀번호가 기본 비밀번호인 학생만 새 비밀번호로 바꾼다.
 * (이미 바꾼 학생은 설정 화면에서 현재 비밀번호를 넣고 바꾼다)
 * @param {{ teacher_id: string, userId: string, newPassword: string }} p
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export async function changeDefaultStudentPasswordService({ teacher_id, userId, newPassword }) {
  const problem = checkNewStudentPassword(newPassword, userId);
  if (problem) return { ok: false, message: problem };

  let teacherOid;
  try {
    teacherOid = ObjectId.createFromHexString(String(teacher_id));
  } catch {
    return { ok: false, message: "잘못된 요청입니다." };
  }

  const users = (await connectDB).db("user").collection("users");
  const user = await users.findOne({ userId: String(userId), role: "student", teacher_id: teacherOid, disabled: { $ne: true } });
  const hashed = user?.passwordHash ?? user?.password;
  if (!hashed) return { ok: false, message: "계정을 찾을 수 없습니다." };
  if (!(await compare(DEFAULT_STUDENT_PASSWORD, hashed))) {
    return { ok: false, message: "이미 비밀번호를 바꾼 계정입니다." };
  }

  await users.updateOne({ _id: user._id }, { $set: { passwordHash: await hash(String(newPassword), 12) }, $unset: { password: "" } });
  return { ok: true };
}
