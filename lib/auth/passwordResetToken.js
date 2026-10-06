// 비밀번호 재설정 통과권
//
// 이메일 코드를 맞히면 발급하고, 마지막 단계(새 비밀번호 저장)는 이 통과권이 있어야 한다.
// - 10분 유효
// - 발급 당시 비밀번호 해시의 지문(v)을 담는다 → 비밀번호가 한 번 바뀌면 같은 통과권은 다시 못 쓴다.
// 형식: base64url(JSON) + "." + HMAC 서명 (키오스크 토큰과 같은 방식, 용도 구분 문자열만 다름)
import crypto from "crypto";

export const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;

function secret() {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET missing");
  return s;
}

const sign = (data) => crypto.createHmac("sha256", secret()).update("pwreset:" + data).digest("base64url");

/** 비밀번호 해시 지문 (해시 자체는 토큰에 넣지 않는다) */
export function passwordFingerprint(passwordHash) {
  return crypto.createHash("sha256").update(String(passwordHash ?? "")).digest("base64url").slice(0, 16);
}

export function createResetToken({ email, passwordHash, now = Date.now(), ttlMs = RESET_TOKEN_TTL_MS }) {
  const payload = Buffer.from(
    JSON.stringify({ e: email, v: passwordFingerprint(passwordHash), exp: now + ttlMs })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** 서명·만료가 맞으면 { email, v }, 아니면 null */
export function readResetToken(token, { now = Date.now() } = {}) {
  if (typeof token !== "string") return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data?.exp !== "number" || data.exp <= now || typeof data.e !== "string") return null;
    return { email: data.e, v: data.v };
  } catch {
    return null;
  }
}
