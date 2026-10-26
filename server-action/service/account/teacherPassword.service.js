// 선생님: 관리자가 발급한 임시 비밀번호로 로그인한 뒤 새 비밀번호 정하기
// (관리자 '계정 도우미' → users.mustChangePassword = true)
import { ObjectId } from "mongodb";
import { hash, compare } from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { PASSWORD_MIN_LENGTH } from "@/server-action/service/auth/passwordReset.service";

const fail = (message) => ({ ok: false, message });

export async function changeTeacherTempPasswordService({ teacher_id, newPassword, now = new Date() }) {
  const pwd = String(newPassword ?? "");
  if (pwd.length < PASSWORD_MIN_LENGTH) return fail(`비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 입력해주세요.`);
  if (pwd.length > 100) return fail("비밀번호가 너무 깁니다.");
  if (typeof teacher_id !== "string" || !/^[0-9a-f]{24}$/i.test(teacher_id)) return fail("로그인이 필요합니다.");

  const users = (await connectDB).db("user").collection("users");
  const _id = ObjectId.createFromHexString(teacher_id);
  const teacher = await users.findOne({ _id, role: "teacher", disabled: { $ne: true } }, { projection: { passwordHash: 1, password: 1, mustChangePassword: 1 } });
  if (!teacher) return fail("계정을 찾을 수 없습니다.");
  if (!teacher.mustChangePassword) return fail("이미 비밀번호를 바꿨습니다. 다시 로그인해주세요.");
  const old = teacher.passwordHash ?? teacher.password;
  if (old && (await compare(pwd, old))) return fail("임시 비밀번호와 다른 비밀번호로 정해주세요.");

  await users.updateOne(
    { _id, mustChangePassword: true },
    { $set: { passwordHash: await hash(pwd, 12), passwordChangedAt: now, updatedAt: now }, $unset: { password: "", mustChangePassword: "" } }
  );
  return { ok: true };
}
