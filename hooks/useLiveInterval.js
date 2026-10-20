"use client";
import { useEffect, useState } from "react";

const IDLE_AFTER_MS = 10 * 60_000;

/**
 * 자동 새로고침 간격: 화면을 쓰고 있으면 fast(기본 15초),
 * 10분 동안 누르거나 입력한 게 없으면 slow(기본 1분)로 늘린다. 다시 쓰면 바로 fast로.
 * (수업이 끝나도 켜 둔 키오스크·온도계 화면이 서버를 계속 부르지 않게)
 */
export function useLiveInterval(fast = 15_000, slow = 60_000) {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let timer;
    const wake = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), IDLE_AFTER_MS);
    };
    const events = ["pointerdown", "keydown", "wheel", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, wake, { passive: true }));
    wake();
    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, wake));
    };
  }, []);

  return idle ? slow : fast;
}
