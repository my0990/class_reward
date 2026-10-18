"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { rawNoise, smoothNoise } from "@/util/timer/timerMath";

/**
 * 마이크 소음 측정.
 * - 측정은 requestAnimationFrame + ref로 하고, 화면 값은 0.1초에 한 번·값이 바뀔 때만 갱신
 * - 끄거나 페이지를 나가면 마이크(트랙)와 AudioContext를 반드시 닫는다
 *   (예전: 닫지 않아 마이크 표시등이 계속 켜져 있었음)
 * - 100을 넘으면 onLoud (5초에 한 번까지)
 */
export function useNoiseMeter({ sensitivity = 50, onLoud } = {}) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState(0);
  const stateRef = useRef({});
  const sensRef = useRef(sensitivity);
  sensRef.current = sensitivity;
  const onLoudRef = useRef(onLoud);
  onLoudRef.current = onLoud;

  const stop = useCallback(() => {
    const s = stateRef.current;
    cancelAnimationFrame(s.raf);
    s.stream?.getTracks().forEach((t) => t.stop());
    s.ctx?.close().catch(() => {});
    stateRef.current = {};
    setActive(false);
    setValue(0);
  }, []);

  const start = useCallback(async () => {
    if (stateRef.current.ctx || stateRef.current.pending) return;
    const pending = {};
    stateRef.current = { pending };
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch (e) {
      stateRef.current = {};
      throw e;
    }
    // 기다리는 사이에 꺼졌거나 페이지를 나갔으면 바로 닫는다
    if (stateRef.current.pending !== pending) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = ctx.createAnalyser();
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.frequencyBinCount);

    const s = { stream, ctx, smooth: 0, last: performance.now(), shown: -1, shownAt: 0, loudAt: 0, raf: 0 };
    stateRef.current = s;
    const loop = (now) => {
      if (stateRef.current !== s) return;
      analyser.getByteFrequencyData(buf);
      const dt = Math.min(now - s.last, 200);
      s.last = now;
      s.smooth = smoothNoise(s.smooth, rawNoise(buf, sensRef.current), dt);
      const v = Math.round(s.smooth);
      if (v !== s.shown && now - s.shownAt >= 100) {
        s.shown = v;
        s.shownAt = now;
        setValue(v);
      }
      if (s.smooth > 100 && now - s.loudAt >= 5000) {
        s.loudAt = now;
        onLoudRef.current?.();
      }
      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);
    setActive(true);
  }, []);

  useEffect(() => stop, [stop]);

  return { active, value, start, stop };
}
