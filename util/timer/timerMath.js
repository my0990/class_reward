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

/** 목소리 구간: 이 밖(바람·에어컨 웅웅거림, 아주 높은 소리)은 세지 않는다 */
export const VOICE_BAND = { low: 300, high: 4000 };

/** A 가중치(사람 귀 감도) 배율. 1kHz = 1, 낮은 소리일수록 작아진다 */
export function aWeight(f) {
  const f2 = f * f;
  const ra =
    (12194 ** 2 * f2 * f2) /
    ((f2 + 20.6 ** 2) * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2));
  return Math.pow(10, (20 * Math.log10(ra) + 2.0) / 20);
}

/** 주파수 막대마다의 비중 (목소리 구간 밖은 0) — 측정 시작할 때 한 번만 계산 */
export function voiceWeights(binCount, sampleRate) {
  const binHz = sampleRate / 2 / binCount;
  const w = new Float32Array(binCount);
  for (let i = 0; i < binCount; i++) {
    const f = (i + 0.5) * binHz;
    w[i] = f >= VOICE_BAND.low && f <= VOICE_BAND.high ? aWeight(f) : 0;
  }
  return w;
}

/**
 * 소음 측정값 = 목소리 구간 막대(0~255)의 가중 평균 × 0.1024 × 민감도
 * 0.1024는 예전 계산식(전체 1024개 막대 합 / 10000 × 민감도)과
 * 고르게 퍼진 소리에서 같은 숫자가 나오게 맞춘 값.
 * 비중을 안 주면 예전처럼 모든 막대를 똑같이 센다.
 */
export function rawNoise(freqBytes, sensitivity, weights) {
  let sum = 0;
  let wsum = 0;
  for (let i = 0; i < freqBytes.length; i++) {
    const w = weights ? weights[i] : 1;
    sum += freqBytes[i] * w;
    wsum += w;
  }
  if (!wsum) return 0;
  return (sum / wsum) * 0.1024 * sensitivity;
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
