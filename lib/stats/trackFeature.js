"use client";
// 화면에서만 도는 기능(번호 뽑기, 타이머, 판서 등) 사용을 서버에 알린다 → 관리자 '기능 사용량'
import { isFeature } from "./featureList";

export function trackFeature(feature, classId) {
  try {
    if (process.env.NODE_ENV !== "production" || !isFeature(feature)) return;
    const body = JSON.stringify({ feature, classId: classId ? String(classId) : null });
    const url = "/api/feature-usage";
    if (navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }))) return;
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch {
    /* 세다가 실패해도 화면에는 영향 없게 */
  }
}
