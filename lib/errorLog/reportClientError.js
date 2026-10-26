"use client";
// 브라우저에서 난 에러를 서버(/api/client-error)로 보낸다 → 관리자 대시보드 '최근 에러'
// - 배포된 사이트에서만, 한 페이지에서 같은 에러는 한 번, 최대 10개까지
// - 개인 정보는 보내기 전에 가린다 (errorCore.maskText)
import { maskText, cleanPath, isNoise, LIMITS } from "./errorCore";

const MAX_PER_PAGE = 10;
const sent = new Set();

export function reportClientError(error, { source = "client" } = {}) {
  try {
    if (process.env.NODE_ENV !== "production") return;
    if (error && typeof error === "object" && error.__kkyulReported) return;

    const message = String(error?.message ?? error ?? "");
    const stack = String(error?.stack ?? "");
    if (!message || isNoise(message, stack)) return;

    const key = `${source}|${message.slice(0, 200)}`;
    if (sent.has(key) || sent.size >= MAX_PER_PAGE) return;
    sent.add(key);
    if (error && typeof error === "object") {
      try {
        error.__kkyulReported = true;
      } catch {
        /* 얼린 객체 */
      }
    }

    const body = JSON.stringify({
      source,
      message: maskText(message).slice(0, LIMITS.message),
      stack: maskText(stack).slice(0, LIMITS.stack),
      path: cleanPath(window.location.pathname),
      digest: error?.digest ?? null,
    });
    const url = "/api/client-error";
    if (navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }))) return;
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch {
    /* 신고하다 또 에러가 나도 화면에는 영향 없게 */
  }
}
