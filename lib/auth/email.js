import crypto from "crypto";

export function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Math.random은 예측 가능해서 인증 코드에 쓰면 안 된다. 암호학적으로 안전한 난수를 쓴다.
export function generateCode6() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashCode(code) {
  const key = process.env.EMAIL_CODE_HMAC_KEY;
  if (!key) throw new Error("EMAIL_CODE_HMAC_KEY missing");
  return crypto.createHmac("sha256", key).update(code).digest("hex");
}