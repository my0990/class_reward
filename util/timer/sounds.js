// 알림음은 파일 대신 Web Audio로 직접 만든다 (내려받을 파일 0개).
// 브라우저는 사용자가 누른 뒤에만 소리를 허락하므로, 시작 버튼에서 unlockSound()를 먼저 부른다.
//
// 크게 들리게 하는 방법
// - 모든 소리를 '전체 볼륨 → 압축기(compressor)'에 통과시킨다: 큰 봉우리를 눌러 깨지지 않게 하면서 전체를 크게
// - 귀가 잘 듣는 높은 음(1~2kHz)과 배음이 섞인 파형을 쓰고, 한 옥타브 위 소리를 겹친다
let ctx = null;
let master = null; // 소리들이 모이는 곳 (압축기 앞, 고정으로 키움)
let output = null; // 압축기 뒤 볼륨 (설정의 '알림음 크기')
let volume = 1.5; // 0.5 ~ 2 (50~200%)
// 압축기 뒤 볼륨: 200%일 때도 소리가 깨지지 않는(1.0을 넘지 않는) 크기
const outGain = (v) => v * 0.6;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 6;
    comp.ratio.value = 8;
    comp.attack.value = 0.002;
    comp.release.value = 0.2;
    master = ctx.createGain();
    master.gain.value = 1.6; // 압축기가 봉우리를 눌러 주므로 키워도 깨지지 않는다
    output = ctx.createGain();
    output.gain.value = outGain(volume);
    master.connect(comp).connect(output).connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** 알림음 크기 (퍼센트, 50~200) */
export function setSoundVolume(percent) {
  volume = Math.min(2, Math.max(0.5, Number(percent) / 100 || 1));
  if (output && ctx) output.gain.setTargetAtTime(outGain(volume), ctx.currentTime, 0.02);
}

function tone(freq, at, dur, { type = "triangle", gain = 0.6, octave = 0.35 } = {}) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + at;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.setValueAtTime(gain, t0 + dur * 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  g.connect(master);
  const freqs = octave > 0 ? [[freq, 1], [freq * 2, octave]] : [[freq, 1]];
  for (const [f, level] of freqs) {
    const osc = c.createOscillator();
    const lg = c.createGain();
    osc.type = type;
    osc.frequency.value = f;
    lg.gain.value = level;
    osc.connect(lg).connect(g);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
}

export const unlockSound = () => void audio();

/** 끝나기 3·2·1초 전 */
export const playCountdown = () => tone(1047, 0, 0.18, { gain: 0.7 });

/**
 * 종·실로폰처럼 '땡' 치고 서서히 사라지는 소리.
 * partials: [배수, 크기] — 실제 종은 배음이 정수배가 아니라서 그 비율을 흉내 낸다
 */
function strike(freq, at, dur, { gain = 0.7, partials = [[1, 1]], type = "sine" } = {}) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + at;
  for (const [ratio, level] of partials) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq * ratio;
    // 높은 배음일수록 빨리 사라진다
    const d = dur / Math.max(1, ratio * 0.6);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain * level, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + d + 0.05);
  }
}

const BELL = [[1, 1], [2.0, 0.45], [2.76, 0.3], [5.4, 0.15]];
const MARIMBA = [[1, 1], [4.0, 0.25], [9.9, 0.06]];

/** 끝 알림음 종류 (타이머 설정에서 고름) */
export const DONE_SOUNDS = {
  chime: {
    label: "기본 (띵띵띵띵)",
    // 올라가는 4음을 천천히 한 번 (약 2.8초)
    play: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.5, i === 3 ? 1.3 : 0.8, { gain: 0.7 })),
  },
  school: {
    label: "학교종 (딩동댕동)",
    // 미-도-레-솔 … 솔-레-미-도 (학교 종소리 가락)
    play: () =>
      [659, 523, 587, 392, 392, 587, 659, 523].forEach((f, i) =>
        strike(f, i * 0.55 + (i >= 4 ? 0.35 : 0), i === 7 ? 2.0 : 1.4, { gain: 0.85, partials: BELL }),
      ),
  },
  alarm: {
    label: "알람시계 (따르릉)",
    // 아주 빠르게 두드리는 높은 종소리를 1초씩 두 번
    play: () => {
      for (let burst = 0; burst < 2; burst++) {
        for (let i = 0; i < 22; i++) strike(2093, burst * 1.4 + i * 0.045, 0.09, { gain: 0.7, partials: [[1, 1], [1.5, 0.5]], type: "square" });
      }
    },
  },
  marimba: {
    label: "마림바",
    // 도-미-솔-도 / 솔-도 (밝게 끝나는 짧은 가락)
    play: () =>
      [
        [523, 0],
        [659, 0.25],
        [784, 0.5],
        [1047, 0.75],
        [784, 1.15],
        [1047, 1.4],
      ].forEach(([f, t], i) => strike(f, t, i === 5 ? 1.2 : 0.6, { gain: 1.2, partials: MARIMBA })),
  },
  whistle: {
    label: "호루라기 (삑— 삑—)",
    play: () => {
      const c = audio();
      if (!c) return;
      [
        [0, 0.35],
        [0.55, 0.9],
      ].forEach(([at, dur]) => {
        const t0 = c.currentTime + at;
        const osc = c.createOscillator();
        const lfo = c.createOscillator(); // 호루라기 안 구슬이 떠는 소리
        const lfoGain = c.createGain();
        const g = c.createGain();
        osc.type = "sine";
        osc.frequency.value = 2600;
        lfo.frequency.value = 38;
        lfoGain.gain.value = 120;
        lfo.connect(lfoGain).connect(osc.frequency);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.55, t0 + 0.02);
        g.gain.setValueAtTime(0.55, t0 + dur - 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(g).connect(master);
        osc.start(t0);
        lfo.start(t0);
        osc.stop(t0 + dur + 0.05);
        lfo.stop(t0 + dur + 0.05);
      });
    },
  },
};

/** 끝 (kind: DONE_SOUNDS의 키, 모르는 값이면 기본) */
export const playDone = (kind = "chime") => (DONE_SOUNDS[kind] ?? DONE_SOUNDS.chime).play();

/** 너무 시끄러울 때 */
export const playLoud = () => {
  tone(440, 0, 0.22, { type: "square", gain: 0.25, octave: 0 });
  tone(440, 0.3, 0.22, { type: "square", gain: 0.25, octave: 0 });
};
