import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { compare } from "bcryptjs";
import { isDefaultStudentPassword } from "@/lib/auth/studentPassword";

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MS = 5 * 60 * 1000; // 5분

const WRONG_PASSWORD = "비밀번호를 확인해주세요.";

/**
 * 키오스크에서 학생 비밀번호 확인
 * - 이 교사의 학생만 대상 (teacher_id 스코핑)
 * - 5번 틀리면 5분 동안 잠근다 (학생 비밀번호 무차별 대입 방지)
 * - 학생이 없거나 비밀번호가 틀려도 같은 메시지 (존재 여부 노출 방지)
 * 성공하면 { ok: true, classId, mustChangePassword }, 실패하면 { ok: false, message }
 */
export async function verifyStudentPasswordService({ teacher_id, userId, userPwd, now = new Date() }) {
  if (!userId || !userPwd) {
    return { ok: false, message: "잘못된 요청입니다." };
  }

  let teacherObjectId;
  try {
    teacherObjectId = ObjectId.createFromHexString(teacher_id);
  } catch {
    return { ok: false, message: "잘못된 요청입니다." };
  }

  const db = (await connectDB).db("user");
  const attempts = db.collection("kiosk_pwd_attempts");
  const attemptKey = { teacher_id: teacherObjectId, userId: String(userId) };

  const current = await attempts.findOne(attemptKey);
  if (current?.lockedUntil && current.lockedUntil > now) {
    const minutes = Math.ceil((current.lockedUntil - now) / 60000);
    return {
      ok: false,
      locked: true,
      message: `비밀번호를 ${MAX_FAILED_ATTEMPTS}번 틀려서 잠겼습니다. ${minutes}분 뒤에 다시 시도해주세요.`,
    };
  }

  const user = await db.collection("users").findOne({
    userId: String(userId),
    role: "student",
    teacher_id: teacherObjectId,
    disabled: { $ne: true },
  });

  const hashed = user?.passwordHash ?? user?.password;
  const isCorrect = hashed ? await compare(String(userPwd), hashed) : false;

  if (!isCorrect) {
    const updated = await attempts.findOneAndUpdate(
      attemptKey,
      { $inc: { failedCount: 1 }, $set: { updatedAt: now }, $unset: { lockedUntil: "" } },
      { upsert: true, returnDocument: "after" }
    );

    if (updated.failedCount >= MAX_FAILED_ATTEMPTS) {
      await attempts.updateOne(attemptKey, {
        $set: { failedCount: 0, lockedUntil: new Date(now.getTime() + LOCK_MS) },
      });
      return {
        ok: false,
        locked: true,
        message: `비밀번호를 ${MAX_FAILED_ATTEMPTS}번 틀려서 5분 동안 잠겼습니다.`,
      };
    }

    const left = MAX_FAILED_ATTEMPTS - updated.failedCount;
    return { ok: false, message: `${WRONG_PASSWORD} (${left}번 더 틀리면 5분 동안 잠겨요)` };
  }

  await attempts.deleteOne(attemptKey);

  // 기본 비밀번호 그대로면 키오스크에서 새 비밀번호를 먼저 정하게 한다
  return { ok: true, classId: user.classId?.toString() ?? null, mustChangePassword: isDefaultStudentPassword(userPwd) };
}
