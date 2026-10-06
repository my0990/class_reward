// 교사 비밀번호 찾기 (이메일 6자리 코드)
//
// ① requestPasswordResetService : 코드 발송. 가입 여부와 상관없이 같은 응답 (가입 여부를 알려주지 않는다)
// ② verifyPasswordResetCodeService : 코드 확인 (5번 틀리면 무효) → 10분짜리 통과권(resetToken)
// ③ resetPasswordService : 통과권 + 새 비밀번호 → 저장, passwordChangedAt 기록(다른 기기 로그아웃)
//
// 재설정 코드는 회원가입 코드(email_verifications)와 섞이지 않게 user.password_resets에 따로 둔다.
import { hash } from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { normalizeEmail, isValidEmailFormat, generateCode6, hashCode } from "@/lib/auth/email";
import { createResetToken, readResetToken, passwordFingerprint } from "@/lib/auth/passwordResetToken";
import { reserveEmailSend, EMAIL_LIMITS } from "@/server-action/service/auth/emailCode.service";

export const PASSWORD_MIN_LENGTH = 8; // 회원가입과 같은 규칙
export const RESET_CODE_ATTEMPTS = 5;
export const RESET_SENT_MESSAGE = "가입된 이메일이면 인증 코드를 보냈습니다. 메일함(스팸함 포함)을 확인해주세요.";

const fail = (message, extra = {}) => ({ ok: false, message, ...extra });

async function userDb() {
  return (await connectDB).db("user");
}

const findTeacher = (db, email) =>
  db.collection("users").findOne({ role: "teacher", email, disabled: { $ne: true } });

/** ① 코드 발송 */
export async function requestPasswordResetService({ email, ip = null, now = new Date(), sendMail }) {
  const e = normalizeEmail(email);
  if (!isValidEmailFormat(e) || e.length > 254) return fail("이메일 형식이 올바르지 않습니다.");

  const db = await userDb();
  const limited = await reserveEmailSend({ db, email: e, ip, now });
  if (limited) return fail(limited.message, { retryAfterSec: limited.retryAfterSec });

  const teacher = await findTeacher(db, e);
  if (!teacher) return { ok: true, message: RESET_SENT_MESSAGE }; // 없는 이메일도 같은 응답

  const code = generateCode6();
  await db.collection("password_resets").updateOne(
    { email: e },
    {
      $set: {
        email: e,
        codeHash: hashCode(code),
        expiresAt: new Date(now.getTime() + EMAIL_LIMITS.CODE_TTL_MS),
        attemptsLeft: RESET_CODE_ATTEMPTS,
        createdAt: now,
      },
    },
    { upsert: true }
  );

  const sent = await sendMail({ to: e, code });
  if (!sent?.ok) return fail("메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
  return { ok: true, message: RESET_SENT_MESSAGE };
}

/** ② 코드 확인 → 통과권 */
export async function verifyPasswordResetCodeService({ email, code, now = new Date() }) {
  const e = normalizeEmail(email);
  const c = String(code ?? "").trim();
  if (!/^\d{6}$/.test(c)) return fail("인증 코드는 6자리 숫자입니다.");

  const db = await userDb();
  const resets = db.collection("password_resets");
  const doc = await resets.findOne({ email: e });
  if (!doc || doc.expiresAt <= now || doc.attemptsLeft <= 0) {
    return fail("인증 코드가 만료되었거나 없습니다. 코드를 다시 받아주세요.");
  }

  if (hashCode(c) !== doc.codeHash) {
    const left = doc.attemptsLeft - 1;
    await resets.updateOne({ _id: doc._id }, { $set: { attemptsLeft: left } });
    return fail(left > 0 ? `인증 코드가 올바르지 않습니다. (${left}번 남음)` : "인증 코드를 5번 틀렸습니다. 코드를 다시 받아주세요.");
  }

  const teacher = await findTeacher(db, e);
  if (!teacher) return fail("인증 코드가 만료되었거나 없습니다. 코드를 다시 받아주세요.");

  await resets.deleteOne({ _id: doc._id }); // 코드는 한 번만
  const resetToken = createResetToken({ email: e, passwordHash: teacher.passwordHash ?? teacher.password, now: now.getTime() });
  return { ok: true, resetToken };
}

/** ③ 새 비밀번호 저장 */
export async function resetPasswordService({ resetToken, newPassword, now = new Date() }) {
  const data = readResetToken(resetToken, { now: now.getTime() });
  if (!data) return fail("시간이 지났습니다. 처음부터 다시 진행해주세요.");

  const pwd = String(newPassword ?? "");
  if (pwd.length < PASSWORD_MIN_LENGTH) return fail(`비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 입력해주세요.`);
  if (pwd.length > 100) return fail("비밀번호가 너무 깁니다.");

  const db = await userDb();
  const teacher = await findTeacher(db, data.email);
  // 통과권을 받은 뒤 이미 비밀번호가 바뀌었으면(통과권 재사용) 거부
  if (!teacher || passwordFingerprint(teacher.passwordHash ?? teacher.password) !== data.v) {
    return fail("시간이 지났습니다. 처음부터 다시 진행해주세요.");
  }

  await db.collection("users").updateOne(
    { _id: teacher._id },
    { $set: { passwordHash: await hash(pwd, 12), passwordChangedAt: now, updatedAt: now }, $unset: { password: "" } }
  );
  return { ok: true, message: "비밀번호를 바꿨습니다. 새 비밀번호로 로그인해주세요." };
}
