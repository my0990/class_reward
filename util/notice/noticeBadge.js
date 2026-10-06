// 헤더 "새 공지" 표시 규칙
// - 공지사항 화면을 열면 그때의 최신 공지 시각을 이 브라우저에 기억한다 (localStorage)
// - 기억한 시각보다 새 공지가 있으면 표시
// - 한 번도 공지 화면을 안 열었으면, 최근 NEW_DAYS일 안에 올라온 공지가 있을 때만 표시
export const NOTICE_SEEN_KEY = "noticeSeenAt";
export const NOTICE_SEEN_EVENT = "notice-seen";
export const NEW_DAYS = 14;

export function hasUnreadNotice(latestAt, seenAt, now = Date.now()) {
  const latest = Date.parse(latestAt ?? "");
  if (!Number.isFinite(latest)) return false;
  const seen = Date.parse(seenAt ?? "");
  if (Number.isFinite(seen)) return latest > seen;
  return now - latest < NEW_DAYS * 24 * 60 * 60 * 1000;
}

export function readNoticeSeenAt() {
  try {
    return window.localStorage.getItem(NOTICE_SEEN_KEY);
  } catch {
    return null; // 사생활 보호 모드 등
  }
}

export function writeNoticeSeenAt(latestAt) {
  if (!latestAt) return;
  try {
    const prev = Date.parse(window.localStorage.getItem(NOTICE_SEEN_KEY) ?? "");
    if (Number.isFinite(prev) && prev >= Date.parse(latestAt)) return;
    window.localStorage.setItem(NOTICE_SEEN_KEY, latestAt);
  } catch {
    // 저장이 안 돼도 화면은 그대로 동작
  }
  window.dispatchEvent(new Event(NOTICE_SEEN_EVENT)); // 같은 화면의 헤더 표시 바로 끄기
}
