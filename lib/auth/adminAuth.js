// 관리자 계정 인증
//
// - 관리자 계정은 교사/학생과 섞이지 않도록 별도 DB에 둔다: admins.accounts
//   (user.users의 email은 중복 금지라서, 교사로 가입한 이메일을 관리자로도 쓰려면 분리해야 한다)
// - 환경 변수 ADMIN_EMAILS(쉼표로 구분)에 있는 이메일만 관리자로 인정한다.
//   DB에 관리자 계정이 있어도 ADMIN_EMAILS에서 빼면 바로(최대 5분 안에) 권한이 사라진다.
// - 비밀번호 5번 틀리면 15분 잠금 (admins.admin_login_attempts)
import { compare } from "bcryptjs";

export const ADMIN_LOGIN_LIMITS = {
  MAX_FAILS: 5,
  LOCK_MS: 15 * 60 * 1000,
};

/** 관리자 세션 유지 시간 (교사 30일보다 짧게) */
export const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000;

export const ADMIN_LOCKED_MESSAGE = "로그인 시도가 너무 많습니다. 15분 뒤에 다시 시도해주세요.";

export function normalizeAdminEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

/** "a@x.com, B@y.com" → ["a@x.com", "b@y.com"] */
export function parseAdminEmails(value = process.env.ADMIN_EMAILS) {
  return String(value ?? "")
    .split(",")
    .map(normalizeAdminEmail)
    .filter(Boolean);
}

export function isAdminEmail(email, list = parseAdminEmails()) {
  const e = normalizeAdminEmail(email);
  return Boolean(e) && list.includes(e);
}

/** 세션 user가 지금도 관리자인지 (role + 허용 목록 + 세션 만료) */
export function isAdminSessionUser(user, now = Date.now()) {
  if (user?.role !== "admin") return false;
  if (!isAdminEmail(user.email)) return false;
  if (typeof user.expiresAt === "number" && now > user.expiresAt) return false;
  return true;
}

export class AdminLockedError extends Error {
  constructor() {
    super(ADMIN_LOCKED_MESSAGE);
  }
}

/**
 * 관리자 로그인 확인. 성공하면 { _id, email }, 실패하면 null.
 * 잠겨 있으면 AdminLockedError를 던진다 (NextAuth가 메시지를 그대로 화면에 넘겨준다).
 * @param {import("mongodb").Db} db  admins DB
 */
export async function authorizeAdmin(db, { email, password }, { now = new Date() } = {}) {
  const e = normalizeAdminEmail(email);
  const pwd = String(password ?? "");
  if (!e || !pwd) return null;

  const attempts = db.collection("admin_login_attempts");
  const record = await attempts.findOne({ email: e });
  if (record?.lockedUntil && record.lockedUntil > now) {
    throw new AdminLockedError();
  }

  // 허용 목록에 없는 이메일도 똑같이 "실패"로 센다 (어떤 이메일이 관리자인지 알려주지 않는다)
  const account = isAdminEmail(e) ? await db.collection("accounts").findOne({ email: e }) : null;
  const ok = account?.passwordHash ? await compare(pwd, account.passwordHash) : false;

  if (!ok) {
    const lockExpired = record?.lockedUntil && record.lockedUntil <= now;
    const failCount = (lockExpired ? 0 : record?.failCount ?? 0) + 1;
    const locked = failCount >= ADMIN_LOGIN_LIMITS.MAX_FAILS;
    await attempts.updateOne(
      { email: e },
      {
        $set: {
          failCount: locked ? 0 : failCount,
          lockedUntil: locked ? new Date(now.getTime() + ADMIN_LOGIN_LIMITS.LOCK_MS) : null,
          updatedAt: now,
        },
      },
      { upsert: true }
    );
    if (locked) {
      await writeAuditLog(db, { adminEmail: e, action: "login_locked", now });
      throw new AdminLockedError();
    }
    return null;
  }

  await attempts.deleteOne({ email: e });
  await db.collection("accounts").updateOne({ _id: account._id }, { $set: { lastLoginAt: now, lastSeenAt: now } });
  await writeAuditLog(db, { adminEmail: e, action: "login", now });
  return { _id: account._id.toString(), email: e };
}

/** 관리자 작업 기록 (admins.audit_log). 기록 실패가 본 작업을 막지 않게 한다. */
export async function writeAuditLog(db, { adminEmail, action, target = null, detail = null, now = new Date() }) {
  try {
    await db.collection("audit_log").insertOne({ at: now, adminEmail, action, target, detail });
  } catch (err) {
    console.error("[admin audit]", err);
  }
}
