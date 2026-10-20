// 학급 확인(requireActiveClass) 결과를 서버가 1분 동안 기억한다.
// 자동 새로고침(15초)마다 학급이 있는지 DB를 한 번 더 읽지 않게 해서 DB 작업 수를 줄인다.
// - '있음'만 기억하고, 없음·삭제됨은 매번 DB로 확인한다.
// - 같은 서버에서 휴지통으로 옮기면 바로 잊는다(forgetActiveClass). 다른 서버 인스턴스는 최대 1분 늦게 반영된다.
const TTL_MS = 60_000;
const MAX = 5000;
const cache = new Map(); // "teacherId:classId" → 확인한 시각

const keyOf = (teacherId, classId) => `${String(teacherId)}:${String(classId)}`;

export function isActiveClassCached(teacherId, classId, now = Date.now()) {
  const at = cache.get(keyOf(teacherId, classId));
  return Boolean(at) && now - at < TTL_MS;
}

export function rememberActiveClass(teacherId, classId, now = Date.now()) {
  if (cache.size >= MAX) cache.clear(); // 메모리가 끝없이 늘지 않게
  cache.set(keyOf(teacherId, classId), now);
}

export function forgetActiveClass(classId) {
  const suffix = `:${String(classId)}`;
  for (const key of cache.keys()) if (key.endsWith(suffix)) cache.delete(key);
}
