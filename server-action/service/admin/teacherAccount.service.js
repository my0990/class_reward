// 관리자 '계정 도우미': 선생님 이메일로 계정 상태를 보고, 잠금 풀기·메일 제한 풀기·임시 비밀번호 발급
//
// - 이메일을 정확히 입력해야 찾는다 (비슷한 이메일 검색 없음)
// - 보여주는 것은 상태와 숫자뿐: 이름·학생 명단·비밀번호(해시 포함)는 내보내지 않는다
// - 모든 변경은 관리자 작업 기록(admins.audit_log)에 남긴다
// - 임시 비밀번호: 관리자 화면에 한 번만 보여주고, 선생님은 다음 로그인 때 새 비밀번호를 정해야 한다
//   (users.mustChangePassword → proxy가 /teacher/change-password로 보냄)
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { hash } from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { normalizeEmail, isValidEmailFormat } from "@/lib/auth/email";
import { writeAuditLog } from "@/lib/auth/adminAuth";
import { LOGIN_LIMITS } from "@/lib/auth/loginLimit";
import { EMAIL_LIMITS } from "@/server-action/service/auth/emailCode.service";

const DAY = 24 * 60 * 60 * 1000;
const fail = (message) => ({ ok: false, message });
const iso = (d) => (d instanceof Date ? d.toISOString() : null);
const loginKey = (email) => `teacher:${email}`;

// 헷갈리는 글자(0/O, 1/l/I)는 뺀다. 10자리 ≈ 57비트
const TEMP_CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const TEMP_PASSWORD_LENGTH = 10;

export function generateTempPassword(len = TEMP_PASSWORD_LENGTH) {
  let s = "";
  for (let i = 0; i < len; i++) s += TEMP_CHARS[crypto.randomInt(0, TEMP_CHARS.length)];
  // 숫자가 하나는 들어가게
  return /\d/.test(s) ? s : s.slice(0, -1) + String(crypto.randomInt(2, 10));
}

async function dbs() {
  const client = await connectDB;
  return { client, user: client.db("user"), data: client.db("data"), admins: client.db("admins") };
}

function checkEmail(email) {
  const e = normalizeEmail(email);
  if (!isValidEmailFormat(e) || e.length > 254) return { error: "이메일 형식이 올바르지 않습니다." };
  return { e };
}

const findTeacher = (user, e) =>
  user.collection("users").findOne(
    { role: "teacher", email: e },
    { projection: { _id: 1, email: 1, disabled: 1, disabledAt: 1, createdAt: 1, emailVerifiedAt: 1, lastSeenAt: 1, passwordChangedAt: 1, mustChangePassword: 1 } }
  );

/** 이메일로 계정 상태 보기 (계정이 없어도 메일 발송 기록은 보여준다: 가입을 시도했는지 알 수 있게) */
export async function lookupTeacherAccountService({ email, now = new Date() }) {
  const { e, error } = checkEmail(email);
  if (error) return fail(error);
  const { user, data } = await dbs();

  const since = new Date(now.getTime() - DAY);
  const [teacher, sends24h, lastSend, reset, attempt] = await Promise.all([
    findTeacher(user, e),
    user.collection("email_send_log").countDocuments({ email: e, sentAt: { $gt: since } }),
    user.collection("email_send_log").findOne({ email: e }, { sort: { sentAt: -1 }, projection: { sentAt: 1 } }),
    user.collection("password_resets").findOne({ email: e }, { projection: { expiresAt: 1, attemptsLeft: 1, createdAt: 1 } }),
    user.collection("login_attempts").findOne({ key: loginKey(e) }, { projection: { failCount: 1, lockedUntil: 1 } }),
  ]);

  const mail = {
    sent24h: sends24h,
    dailyLimit: EMAIL_LIMITS.PER_EMAIL_PER_DAY,
    limited: sends24h >= EMAIL_LIMITS.PER_EMAIL_PER_DAY,
    lastSentAt: iso(lastSend?.sentAt),
  };

  if (!teacher) return { ok: true, found: false, email: e, mail };

  const ids = [teacher._id, String(teacher._id)];
  const [classes, trashedClasses, students] = await Promise.all([
    data.collection("classes").countDocuments({ teacher_id: { $in: ids }, deletedAt: { $exists: false } }),
    data.collection("classes").countDocuments({ teacher_id: { $in: ids }, deletedAt: { $exists: true } }),
    user.collection("users").countDocuments({ role: "student", teacher_id: { $in: ids } }),
  ]);

  const lockedUntil = attempt?.lockedUntil instanceof Date && attempt.lockedUntil > now ? attempt.lockedUntil : null;
  const resetAlive = reset && reset.expiresAt > now && reset.attemptsLeft > 0;

  return {
    ok: true,
    found: true,
    email: e,
    mail,
    account: {
      disabled: Boolean(teacher.disabled),
      disabledAt: iso(teacher.disabledAt),
      createdAt: iso(teacher.createdAt),
      emailVerifiedAt: iso(teacher.emailVerifiedAt),
      lastSeenAt: iso(teacher.lastSeenAt),
      passwordChangedAt: iso(teacher.passwordChangedAt),
      mustChangePassword: Boolean(teacher.mustChangePassword),
      classes,
      trashedClasses,
      students,
    },
    login: {
      failCount: attempt?.failCount ?? 0,
      maxFails: LOGIN_LIMITS.MAX_FAILS,
      lockedUntil: iso(lockedUntil),
    },
    resetCode: reset
      ? { alive: Boolean(resetAlive), expiresAt: iso(reset.expiresAt), attemptsLeft: reset.attemptsLeft ?? 0, sentAt: iso(reset.createdAt) }
      : null,
  };
}

/** 로그인 잠금 풀기 (틀린 횟수 초기화) */
export async function unlockTeacherLoginService({ adminEmail, email, now = new Date() }) {
  const { e, error } = checkEmail(email);
  if (error) return fail(error);
  const { user, admins } = await dbs();
  const r = await user.collection("login_attempts").deleteOne({ key: loginKey(e) });
  await writeAuditLog(admins, { adminEmail, action: "teacher_unlock", target: e, detail: e, now });
  return { ok: true, message: r.deletedCount ? "로그인 잠금을 풀었습니다." : "잠겨 있지 않았습니다." };
}

/** 오늘 인증 메일 제한 풀기: 이 이메일의 최근 24시간 발송 기록을 지운다 (서비스 전체 한도는 그대로) */
export async function clearTeacherEmailLimitService({ adminEmail, email, now = new Date() }) {
  const { e, error } = checkEmail(email);
  if (error) return fail(error);
  const { user, admins } = await dbs();
  const r = await user.collection("email_send_log").deleteMany({ email: e, sentAt: { $gt: new Date(now.getTime() - DAY) } });
  await writeAuditLog(admins, { adminEmail, action: "teacher_mail_limit_clear", target: e, detail: `${e} (${r.deletedCount}건)`, now });
  return { ok: true, message: r.deletedCount ? "메일 발송 제한을 풀었습니다. 바로 인증 코드를 다시 받을 수 있어요." : "지울 발송 기록이 없었습니다." };
}

/**
 * 임시 비밀번호 발급
 * - 다른 기기 로그인은 모두 끝남 (passwordChangedAt)
 * - 다음 로그인 때 새 비밀번호를 정해야 함 (mustChangePassword)
 * - 로그인 잠금·남아 있던 비밀번호 찾기 코드는 지움
 */
export async function issueTeacherTempPasswordService({ adminEmail, email, now = new Date() }) {
  const { e, error } = checkEmail(email);
  if (error) return fail(error);
  const { user, admins } = await dbs();
  const teacher = await findTeacher(user, e);
  if (!teacher) return fail("가입된 선생님 계정이 없습니다.");
  if (teacher.disabled) return fail("탈퇴 처리 중인 계정이라 비밀번호를 바꿀 수 없습니다.");

  const tempPassword = generateTempPassword();
  await user.collection("users").updateOne(
    { _id: teacher._id },
    {
      $set: { passwordHash: await hash(tempPassword, 12), passwordChangedAt: now, mustChangePassword: true, updatedAt: now },
      $unset: { password: "" },
    }
  );
  await Promise.all([
    user.collection("login_attempts").deleteOne({ key: loginKey(e) }),
    user.collection("password_resets").deleteOne({ email: e }),
  ]);
  await writeAuditLog(admins, { adminEmail, action: "teacher_temp_password", target: e, detail: e, now });
  return { ok: true, tempPassword, message: "임시 비밀번호를 만들었습니다." };
}

/**
 * 반 고유 아이디(학급 고유 별명) 또는 학생 아이디로 그 반 선생님의 이메일 찾기
 * - 학생 아이디는 '고유 아이디 + 번호'라서 끝의 숫자를 떼고 다시 찾는다 (예: 해바라기3 → 해바라기)
 * - 이메일이 화면에 나오므로 관리자 작업 기록에 남긴다
 */
export async function findTeacherByClassNicknameService({ adminEmail, keyword, now = new Date() }) {
  const k = String(keyword ?? "").trim();
  if (!k || k.length > 30) return fail("반 고유 아이디나 학생 아이디를 입력해주세요.");
  const { user, data, admins } = await dbs();

  const candidates = [k];
  const stripped = k.replace(/\d+$/, "");
  if (stripped && stripped !== k) candidates.push(stripped);

  let classData = null;
  let matchedBy = null;
  for (const nick of candidates) {
    classData = await data.collection("class_data").findOne({ uniqueNickname: nick }, { projection: { teacher_id: 1, classId: 1, className: 1, uniqueNickname: 1 } });
    if (classData) {
      matchedBy = nick === k ? "class" : "student";
      break;
    }
  }
  if (!classData) return fail("그 아이디를 쓰는 반이 없습니다. 띄어쓰기·오타를 확인해주세요.");

  const tid = classData.teacher_id instanceof ObjectId ? classData.teacher_id : ObjectId.isValid(String(classData.teacher_id)) ? new ObjectId(String(classData.teacher_id)) : null;
  const teacher = tid ? await user.collection("users").findOne({ _id: tid, role: "teacher" }, { projection: { email: 1 } }) : null;
  if (!teacher?.email) return fail("반은 찾았지만 선생님 계정을 찾지 못했습니다.");

  const cls = classData.classId
    ? await data.collection("classes").findOne({ _id: classData.classId }, { projection: { deletedAt: 1 } })
    : null;

  await writeAuditLog(admins, { adminEmail, action: "teacher_find_by_class", target: teacher.email, detail: `${classData.uniqueNickname} → ${teacher.email}`, now });
  return {
    ok: true,
    email: teacher.email,
    className: classData.className ?? "",
    uniqueNickname: classData.uniqueNickname,
    matchedBy,
    classDeleted: Boolean(cls?.deletedAt),
  };
}
