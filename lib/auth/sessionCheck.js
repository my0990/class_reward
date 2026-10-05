// NextAuth jwt 콜백에서 "이 계정이 아직 DB에 있는지" 확인하는 주기 조절
//
// 예전에는 세션을 확인할 때마다(= 거의 모든 API 요청마다) users 컬렉션을 조회했다.
// 자동 새로고침까지 들어가면서 요청이 많아졌으므로, 5분에 한 번만 확인한다.
// 삭제된 계정은 최대 5분 뒤에 로그아웃된다. (데이터 접근은 어차피 서버가 교사/학급으로 다시 확인한다)

export const SESSION_RECHECK_MS = 5 * 60 * 1000;

/**
 * @param {object} token  NextAuth JWT
 * @param {{ now?: number, justSignedIn?: boolean, findUserById: (id: string) => Promise<object|null> }} opts
 * @returns {Promise<object>} 같은 token (invalidUser, checkedAt 갱신)
 */
export async function recheckUser(token, { now = Date.now(), justSignedIn = false, findUserById }) {
  if (!token?.user?._id) return token;

  // 방금 로그인: authorize에서 이미 DB로 확인했다
  if (justSignedIn) {
    token.invalidUser = false;
    token.checkedAt = now;
    return token;
  }

  const recentlyChecked =
    token.invalidUser === false &&
    typeof token.checkedAt === "number" &&
    now - token.checkedAt < SESSION_RECHECK_MS;
  if (recentlyChecked) return token;

  try {
    const user = await findUserById(token.user._id);
    token.invalidUser = !user;
    token.checkedAt = now;
  } catch {
    // DB가 잠깐 안 될 때 사용자를 로그아웃시키지 않는다. 다음 요청에서 다시 확인한다.
    if (token.invalidUser === undefined) token.invalidUser = false;
  }
  return token;
}
