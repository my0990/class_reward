// 알림음은 파일 대신 Web Audio로 직접 만든다 (내려받을 파일 0개).
// 브라우저는 사용자가 누른 뒤에만 소리를 허락하므로, 시작 버튼에서 unlockSound()를 먼저 부른다.
//
// 크게 들리게 하는 방법
// - 모든 소리를 '전체 볼륨 → 압축기(compressor)'에 통과시킨다: 큰 봉우리를 눌러 깨지지 않게 하면서 전체를 크게
// - 귀가 잘 듣는 높은 음(1~2kHz)과 배음이 섞인 파형을 쓰고, 한 옥타브 위 소리를 겹친다
// - 끝 알림은 3번 반복
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

/** 끝: 올라가는 4음을 천천히, 3번 (음 사이 0.3초, 한 번에 약 1.9초, 전체 약 6초) */
export const playDone = () => {
  for (let r = 0; r < 3; r++) {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, r * 2.0 + i * 0.3, i === 3 ? 0.9 : 0.6, { gain: 0.7 }));
  }
};

/** 너무 시끄러울 때 */
export const playLoud = () => {
  tone(440, 0, 0.22, { type: "square", gain: 0.25, octave: 0 });
  tone(440, 0.3, 0.22, { type: "square", gain: 0.25, octave: 0 });
};
