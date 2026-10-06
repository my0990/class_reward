"use client";
import { useEffect, useState, useCallback } from "react";
import { useFetchData } from "@/hooks/useFetchData";
import {
  hasUnreadNotice,
  readNoticeSeenAt,
  writeNoticeSeenAt,
  NOTICE_SEEN_EVENT,
  NOTICE_SEEN_KEY,
} from "@/util/notice/noticeBadge";

// 최신 공지 시각은 5분마다 + 창으로 돌아올 때 확인한다 (가벼운 요청 1개)
const NOTICE_REFRESH = { refreshInterval: 5 * 60_000, revalidateOnFocus: true };

/** { hasNew, latestAt, markSeen } — enabled가 false면 요청하지 않는다 (학생 화면) */
export function useNoticeBadge(enabled = true) {
  const { data } = useFetchData(enabled ? "/api/notices/latest" : null, NOTICE_REFRESH);
  const latestAt = data?.latestAt ?? null;
  const [seenAt, setSeenAt] = useState(null);

  useEffect(() => {
    const sync = () => setSeenAt(readNoticeSeenAt());
    sync();
    const onStorage = (e) => e.key === NOTICE_SEEN_KEY && sync(); // 다른 탭에서 읽은 경우
    window.addEventListener(NOTICE_SEEN_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(NOTICE_SEEN_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const markSeen = useCallback(() => writeNoticeSeenAt(latestAt), [latestAt]);

  return { hasNew: enabled && hasUnreadNotice(latestAt, seenAt), latestAt, markSeen };
}
