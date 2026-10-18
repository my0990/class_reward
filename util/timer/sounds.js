// 알림음은 파일 대신 Web Audio로 직접 만든다 (내려받을 파일 0개).
// 브라우저는 사용자가 누른 뒤에만 소리를 허락하므로, 시작 버튼에서 unlockSound()를 먼저 부른다.
let ctx = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, at, dur, { type = "sine", gain = 0.3 } = {}) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const unlockSound = () => void audio();

/** 끝나기 3·2·1초 전 */
export const playCountdown = () => tone(880, 0, 0.15);

/** 끝 */
export const playDone = () =>
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.16, 0.6, { type: "triangle" }));

/** 너무 시끄러울 때 */
export const playLoud = () => {
  tone(440, 0, 0.22, { type: "square", gain: 0.12 });
  tone(440, 0.3, 0.22, { type: "square", gain: 0.12 });
};
