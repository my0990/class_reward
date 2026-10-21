// 짧게 쓰는 서명 토큰 (키오스크 기기 연결·설정 창 등)
// 형식: base64url(JSON payload) + "." + base64url(HMAC-SHA256 서명). purpose가 다르면 서로 바꿔 쓸 수 없다.
import crypto from "crypto";

function secret() {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET missing");
  return s;
}
const sign = (purpose, payload) => crypto.createHmac("sha256", secret()).update(`${purpose}:${payload}`).digest("base64url");

/** data(작은 객체)를 ttlMs 동안 쓸 수 있는 토큰으로 */
export function createSignedToken(purpose, data, { ttlMs, now = Date.now() }) {
  const payload = Buffer.from(JSON.stringify({ ...data, exp: now + ttlMs })).toString("base64url");
  return `${payload}.${sign(purpose, payload)}`;
}

/** 서명·만료가 맞으면 data, 아니면 null */
export function readSignedToken(purpose, token, { now = Date.now() } = {}) {
  if (typeof token !== "string") return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  const expected = Buffer.from(sign(purpose, payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof data?.exp === "number" && data.exp > now ? data : null;
  } catch {
    return null;
  }
}
