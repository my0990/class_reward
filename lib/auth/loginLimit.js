// 로그인 실패 제한 (학생·교사 로그인 공용)
// 같은 계정으로 5번 틀리면 10분 동안 잠근다. 기록은 user.login_attempts (하루 뒤 자동 삭제 인덱스).
// key 예: "student:6-1반3", "teacher:t@test.com"
export const LOGIN_LIMITS = { MAX_FAILS: 5, LOCK_MS: 10 * 60 * 1000 };

export class LoginLockedError extends Error {
  constructor(minutes) {
    super(`비밀번호를 ${LOGIN_LIMITS.MAX_FAILS}번 틀려서 잠겼습니다. ${minutes}분 뒤에 다시 시도해주세요.`);
  }
}

/** 잠겨 있으면 LoginLockedError를 던진다 */
export async function assertNotLocked(db, key, now = new Date()) {
  const rec = await db.collection("login_attempts").findOne({ key });
  if (rec?.lockedUntil && rec.lockedUntil > now) {
    throw new LoginLockedError(Math.ceil((rec.lockedUntil - now) / 60000));
  }
}

/** 실패 1회 기록. 이번에 잠기면 LoginLockedError를 던진다 */
export async function recordLoginFailure(db, key, now = new Date()) {
  const col = db.collection("login_attempts");
  const rec = await col.findOneAndUpdate(
    { key },
    { $inc: { failCount: 1 }, $set: { updatedAt: now }, $unset: { lockedUntil: "" } },
    { upsert: true, returnDocument: "after" }
  );
  if (rec.failCount >= LOGIN_LIMITS.MAX_FAILS) {
    await col.updateOne({ key }, { $set: { failCount: 0, lockedUntil: new Date(now.getTime() + LOGIN_LIMITS.LOCK_MS) } });
    throw new LoginLockedError(Math.ceil(LOGIN_LIMITS.LOCK_MS / 60000));
  }
}

export async function clearLoginFailures(db, key) {
  await db.collection("login_attempts").deleteOne({ key });
}
