import crypto from "crypto";

export function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateCode6() {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

export function hashCode(code) {
  const key = process.env.EMAIL_CODE_HMAC_KEY;
  if (!key) throw new Error("EMAIL_CODE_HMAC_KEY missing");
  return crypto.createHmac("sha256", key).update(code).digest("hex");
}