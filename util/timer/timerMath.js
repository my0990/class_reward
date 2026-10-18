// 타이머·소음 측정 계산 (화면과 분리 → 단위 테스트)

/** 남은 밀리초 → { h, m, s } (초는 올림: 0.2초 남으면 1초로 보임) */
export function splitTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
}

export const pad2 = (n) => String(n).padStart(2, "0");

/** 시·분·초 중 하나만 바꾼 남은 시간(ms). unit = "h" | "m" | "s", value는 0~99 */
export function replaceUnit(ms, unit, value) {
  const { h, m, s } = splitTime(ms);
  const v = Math.max(0, Math.min(99, Math.floor(Number(value) || 0)));
  const next = { h, m, s, [unit]: v };
  return (next.h * 3600 + next.m * 60 + next.s) * 1000;
}

/** 소음 수치(0~) → 배경색 단계. 측정 중이 아니면 null */
export const NOISE_COLORS = ["#99cc33", "#ffcc00", "#ff9966", "#cc3300", "red"];
export function noiseLevel(value) {
  if (value > 100) return 4;
  if (value > 80) return 3;
  if (value > 60) return 2;
  if (value > 40) return 1;
  return 0;
}

/** 소음 측정값: 주파수 막대(0~255) 합 / 10000 × 민감도 (예전 계산식 그대로) */
export function rawNoise(freqBytes, sensitivity) {
  let sum = 0;
  for (let i = 0; i < freqBytes.length; i++) sum += freqBytes[i];
  return (sum / 10000) * sensitivity;
}

/**
 * 화면에 보이는 값은 천천히 따라가게 (예전: 20ms마다 차이의 1/100씩)
 * dt(ms)가 달라도 같은 속도가 되도록 지수 보정. 110 넘으면 내려가기만 한다.
 */
export function smoothNoise(prev, target, dtMs) {
  const k = 1 - Math.pow(1 - 0.01, dtMs / 20);
  if (prev > target || prev > 110) return prev - (prev - target) * k;
  return prev + (target - prev) * k;
}

/** 원형 타이머 색 (남은 초 기준: 7초 이상 초록 → 노랑 → 주황 → 빨강) */
export function circleColor(remainingSec) {
  if (remainingSec > 7) return "#04B404";
  if (remainingSec > 5) return "#FFFF00";
  if (remainingSec > 2) return "#FF8000";
  return "#FF0000";
}

/** 타이머 화면 테마 */
export const TIMER_THEMES = {
  vintage: { label: "빈티지", bg: "#f3e9d2", fg: "#4a3b2a" },
  ironman: { label: "아이언맨", bg: "#8b1a1a", fg: "#ffd166" },
  blackandwhite: { label: "흑백", bg: "#ffffff", fg: "#111111" },
};
