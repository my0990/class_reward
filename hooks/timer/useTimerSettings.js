"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "kkyul:timer-settings";
export const TIMER_DEFAULTS = {
  sensitivity: 50, // 1~100
  theme: "vintage",
  hideCount: false, // 소음 횟수 숨기기
  muteAlert: false, // 소음 경고음 끄기
  circle: false, // 원형 타이머
  pointerHighlight: false, // 커서를 따라다니는 노란 원
  volume: 150, // 알림음 크기 (%) 50~200
  doneSound: "chime", // 끝 알림음 (util/timer/sounds의 DONE_SOUNDS)
};

/** 설정은 처음 한 번만 읽고, 바뀔 때만 저장 (예전: 그릴 때마다 localStorage 읽음) */
export function useTimerSettings() {
  const [settings, setSettings] = useState(TIMER_DEFAULTS);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved) setSettings({ ...TIMER_DEFAULTS, ...saved });
    } catch {}
  }, []);

  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return [settings, update];
}
