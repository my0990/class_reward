// 키오스크 결제 토큰
//
// 키오스크는 교사 계정으로 로그인된 기기 한 대를 여러 학생이 쓴다.
// 학생이 비밀번호를 맞히면 서버가 "이 교사 기기에서, 이 학급의, 이 학생이, 몇 분 동안"
// 결제해도 된다는 서명 토큰을 발급하고, 구매/사용/기부는 이 토큰이 있어야만 처리한다.
// (예전에는 비밀번호 확인과 결제가 따로 놀아서, 요청만 직접 보내면 비밀번호 없이 결제할 수 있었다.)
//
// 형식: base64url(JSON payload) + "." + base64url(HMAC-SHA256 서명)
import crypto from "crypto";

export const KIOSK_TOKEN_TTL_MS = 3 * 60 * 1000; // 3분

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET missing");
  return secret;
}

function sign(data) {
  return crypto.createHmac("sha256", getSecret()).update("kiosk:" + data).digest("base64url");
}

export function createKioskToken({ teacher_id, classId, userId, now = Date.now(), ttlMs = KIOSK_TOKEN_TTL_MS }) {
  const payload = Buffer.from(
    JSON.stringify({ t: String(teacher_id), c: String(classId), u: String(userId), exp: now + ttlMs })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** 서명·만료·대상(교사/학급/학생)이 모두 맞으면 true */
export function verifyKioskToken(token, { teacher_id, classId, userId, now = Date.now() }) {
  if (typeof token !== "string") return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return false;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return false;

  let data;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return false;
  }

  return (
    typeof data?.exp === "number" &&
    data.exp > now &&
    data.t === String(teacher_id) &&
    data.c === String(classId) &&
    data.u === String(userId)
  );
}
