"use client";
// 비회원 도구(/tools) 사용을 서버에 알린다 → admins.feature_usage (관리자 '기능 사용량'의 비회원 표)
// 횟수만 센다: 이름·IP·기기 정보는 보내지도 남기지도 않는다.
// oncePerDay: 같은 브라우저에서 하루 한 번만 (방문 수)
import { FEATURES } from "./featureList";

const dayKey = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date()); // 2026-11-13

export function trackGuest(feature, { oncePerDay = false } = {}) {
  try {
    if (process.env.NODE_ENV !== "production" || !FEATURES[feature]?.guest) return;
    if (oncePerDay) {
      const key = `kkyul:guest-seen:${feature}`;
      try {
        if (localStorage.getItem(key) === dayKey()) return;
        localStorage.setItem(key, dayKey());
      } catch {
        /* 저장이 막힌 브라우저면 그냥 센다 */
      }
    }
    const body = JSON.stringify({ feature });
    const url = "/api/guest-usage";
    if (navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }))) return;
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch {
    /* 세다가 실패해도 화면에는 영향 없게 */
  }
}
