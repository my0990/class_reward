import { connectDB } from "@/lib/mongodb";
import { normalizeEmail, isValidEmailFormat, generateCode6, hashCode } from "@/lib/auth/email";

// 인증 메일 발송 제한
// Resend 무료 플랜은 하루 100통이다. 누가 발송 버튼(또는 API)을 반복 호출하면 한도가 바닥나서
// 정상 회원가입까지 막히므로 아래처럼 제한한다.
export const EMAIL_LIMITS = {
  COOLDOWN_MS: 60 * 1000,          // 같은 이메일: 1분에 1번
  PER_EMAIL_PER_DAY: 5,            // 같은 이메일: 24시간에 5번
  PER_IP_PER_HOUR: 10,             // 같은 IP: 1시간에 10번
  GLOBAL_PER_DAY: 90,              // 서비스 전체: 24시간에 90번 (무료 한도 100통 중 여유 10통)
  CODE_TTL_MS: 10 * 60 * 1000,     // 인증 코드 유효 시간 10분
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

let indexesReady = null;
async function ensureIndexes(col) {
  // 발송 기록은 하루가 지나면 자동 삭제 (TTL 인덱스). 프로세스당 한 번만 만든다.
  indexesReady ??= Promise.all([
    col.createIndex({ sentAt: 1 }, { expireAfterSeconds: 2 * 24 * 60 * 60 }),
    col.createIndex({ email: 1, sentAt: -1 }),
    col.createIndex({ ip: 1, sentAt: -1 }),
  ]).catch((err) => {
    indexesReady = null; // 다음 요청에서 다시 시도
    throw err;
  });
  return indexesReady;
}

function fail(status, message, extra = {}) {
  return { success: false, status, message, ...extra };
}

/**
 * 인증 메일 발송 제한 확인 + 발송 기록 (회원가입 인증, 비밀번호 찾기 공용)
 * 제한에 걸리면 fail 객체를, 통과하면 기록을 남기고 null을 돌려준다.
 * @param {{ db: import("mongodb").Db, email: string, ip?: string|null, now: Date }} p  db = "user" DB
 */
export async function reserveEmailSend({ db, email: e, ip = null, now }) {
  const logs = db.collection("email_send_log");
  await ensureIndexes(logs);

  // 1) 같은 이메일 1분 쿨다운
  const last = await logs.findOne({ email: e }, { sort: { sentAt: -1 } });
  if (last && now - last.sentAt < EMAIL_LIMITS.COOLDOWN_MS) {
    const retryAfterSec = Math.ceil((EMAIL_LIMITS.COOLDOWN_MS - (now - last.sentAt)) / 1000);
    return fail(429, `${retryAfterSec}초 후에 다시 요청해주세요.`, { retryAfterSec });
  }

  // 2) 같은 이메일 하루 5번
  const emailCount = await logs.countDocuments({ email: e, sentAt: { $gt: new Date(now - DAY) } });
  if (emailCount >= EMAIL_LIMITS.PER_EMAIL_PER_DAY) {
    return fail(429, "이 이메일로는 오늘 인증 코드를 더 받을 수 없습니다. 내일 다시 시도해주세요.");
  }

  // 3) 같은 IP 1시간 10번
  if (ip) {
    const ipCount = await logs.countDocuments({ ip, sentAt: { $gt: new Date(now - HOUR) } });
    if (ipCount >= EMAIL_LIMITS.PER_IP_PER_HOUR) {
      return fail(429, "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  // 4) 서비스 전체 하루 90번
  const globalCount = await logs.countDocuments({ sentAt: { $gt: new Date(now - DAY) } });
  if (globalCount >= EMAIL_LIMITS.GLOBAL_PER_DAY) {
    return fail(503, "오늘 인증 메일 발송량이 많아 잠시 중단되었습니다. 내일 다시 시도해주세요.");
  }

  // 발송 전에 기록한다: 메일 서버가 실패해도 반복 호출을 막기 위해 시도 자체를 센다.
  await logs.insertOne({ email: e, ip, sentAt: now });
  return null;
}

/**
 * 교사 회원가입 이메일 인증 코드 발송
 * @param {{ email: string, ip?: string|null, now?: Date, sendMail: (args:{to:string, code:string}) => Promise<{ok:boolean, message?:string}> }} params
 * @returns {{ success: true } | { success: false, status: number, message: string, retryAfterSec?: number }}
 */
export async function requestEmailCodeService({ email, ip = null, now = new Date(), sendMail }) {
  const e = normalizeEmail(email);
  if (!isValidEmailFormat(e) || e.length > 254) {
    return fail(400, "이메일 형식이 올바르지 않습니다");
  }

  const db = (await connectDB).db("user");

  const exists = await db.collection("users").findOne({ role: "teacher", email: e }, { projection: { _id: 1 } });
  if (exists) {
    return fail(409, "이미 가입된 이메일입니다");
  }

  const limited = await reserveEmailSend({ db, email: e, ip, now });
  if (limited) return limited;

  const code = generateCode6();
  await db.collection("email_verifications").updateOne(
    { email: e },
    {
      $set: {
        email: e,
        codeHash: hashCode(code),
        expiresAt: new Date(now.getTime() + EMAIL_LIMITS.CODE_TTL_MS),
        attemptsLeft: 5,
        createdAt: now,
      },
      $unset: { verifiedAt: "" }, // 새 코드를 받으면 이전 인증은 무효
    },
    { upsert: true }
  );

  const sent = await sendMail({ to: e, code });
  if (!sent?.ok) {
    return fail(502, sent?.message || "메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  return { success: true };
}
