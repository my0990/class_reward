"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 끝나는 시각(endAt)을 기준으로 남은 시간을 계산하는 타이머.
 * - 초가 바뀔 때만 다시 그린다 (예전: 20ms마다 → 초당 50번)
 * - 탭이 뒤로 가서 setTimeout이 늦어져도 시간이 밀리지 않는다
 * status: idle(설정 중) | running | paused | done
 *
 * storageKey를 주면 이 탭(sessionStorage)에 상태를 기억한다 → 다른 화면에 갔다 와도 이어서 흐른다.
 * 화면을 떠나 있는 동안 끝났으면 소리 없이 done + finishedAway=true (돌아와서 갑자기 울리지 않게)
 */
function readState(key) {
  try {
    const v = JSON.parse(sessionStorage.getItem(key) || "null");
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

export function useCountdown({ initialMs = 10 * 60_000, onSecond, onDone, storageKey } = {}) {
  const [setMs, setSetMs] = useState(initialMs);
  const [remainingMs, setRemainingMs] = useState(initialMs);
  const [status, setStatus] = useState("idle");
  const [runId, setRunId] = useState(0); // 원형 타이머 애니메이션을 처음부터 다시 그릴 때 바뀜

  const [finishedAway, setFinishedAway] = useState(false); // 다른 화면에 있는 동안 끝남

  const endAtRef = useRef(0);
  const lastSecRef = useRef(null);
  const cbRef = useRef({});
  cbRef.current = { onSecond, onDone };
  // 기억한 상태를 불러온 '다음 화면'부터 저장한다.
  // (불러오는 effect와 같은 순간에 저장하면, 아직 바뀌기 전 값(00:00)으로 기억을 덮어써 버린다 — 개발 모드에서는 effect가 두 번 돌아 실제로 지워짐)
  const [restored, setRestored] = useState(!storageKey);

  // 처음: 기억한 상태 되살리기
  useEffect(() => {
    if (!storageKey) return;
    const v = readState(storageKey);
    const num = (x) => (Number.isFinite(Number(x)) && Number(x) >= 0 ? Number(x) : null);
    if (v && num(v.setMs) !== null) {
      setSetMs(num(v.setMs));
      if (v.status === "running" && num(v.endAt)) {
        const left = v.endAt - Date.now();
        if (left > 0) {
          endAtRef.current = v.endAt;
          lastSecRef.current = Math.ceil(left / 1000);
          setRemainingMs(left);
          setStatus("running");
        } else {
          setRemainingMs(0);
          setStatus("done");
          setFinishedAway(true);
        }
      } else if (["idle", "paused", "done"].includes(v.status)) {
        setRemainingMs(num(v.remainingMs) ?? 0);
        setStatus(v.status);
      }
      setRunId((n) => n + 1);
    }
    setRestored(true);
  }, [storageKey]);

  // 상태가 바뀌면 기억 (돌아가는 중에는 끝나는 시각만 있으면 되므로 매초 저장하지 않음)
  const savedRemaining = status === "running" ? null : remainingMs;
  useEffect(() => {
    if (!storageKey || !restored) return;
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ status, setMs, remainingMs: savedRemaining, endAt: status === "running" ? endAtRef.current : null }),
      );
    } catch {}
  }, [storageKey, restored, status, setMs, savedRemaining]);

  useEffect(() => {
    if (status !== "running") return undefined;
    let timer;
    const tick = () => {
      const left = endAtRef.current - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        setStatus("done");
        cbRef.current.onDone?.();
        return;
      }
      setRemainingMs(left);
      const sec = Math.ceil(left / 1000);
      if (sec !== lastSecRef.current) {
        lastSecRef.current = sec;
        cbRef.current.onSecond?.(sec);
      }
      timer = setTimeout(tick, (left % 1000) + 5); // 다음 초가 바뀌는 순간에 맞춰 깨어남
    };
    tick();
    return () => clearTimeout(timer);
  }, [status]);

  const start = useCallback(() => {
    if (status === "running") return;
    setFinishedAway(false);
    const base = status === "done" ? setMs : remainingMs;
    if (base <= 0) return;
    endAtRef.current = Date.now() + base;
    lastSecRef.current = Math.ceil(base / 1000);
    if (status !== "paused") setRunId((n) => n + 1);
    if (status === "done") setRemainingMs(base);
    setStatus("running");
  }, [status, setMs, remainingMs]);

  const pause = useCallback(() => {
    if (status !== "running") return;
    setRemainingMs(Math.max(0, endAtRef.current - Date.now()));
    setStatus("paused");
  }, [status]);

  /** 초기화: 00:00:00으로 비운다 */
  const reset = useCallback(() => {
    setFinishedAway(false);
    setStatus("idle");
    setSetMs(0);
    setRemainingMs(0);
    setRunId((n) => n + 1);
  }, []);

  /** 시간 바꾸기 (돌아가는 중에는 무시) */
  const setTime = useCallback(
    (ms) => {
      if (status === "running") return;
      setFinishedAway(false);
      setSetMs(ms);
      setRemainingMs(ms);
      setStatus("idle");
      setRunId((n) => n + 1);
    },
    [status],
  );

  /** 시간 더하기 (돌아가는 중에도 가능). 끝난 뒤에 누르면 그 시간으로 새로 설정 */
  const addTime = useCallback(
    (ms) => {
      setFinishedAway(false);
      if (status === "done") {
        setSetMs(ms);
        setRemainingMs(ms);
        setStatus("idle");
      } else if (status === "running") {
        endAtRef.current += ms;
        setSetMs((t) => t + ms);
        setRemainingMs(Math.max(0, endAtRef.current - Date.now()));
      } else {
        setSetMs(status === "idle" ? remainingMs + ms : (t) => t + ms);
        setRemainingMs((r) => r + ms);
      }
      setRunId((n) => n + 1); // 원형 타이머를 늘어난 전체 시간 기준으로 다시 그림
    },
    [status, remainingMs],
  );

  return { setMs, remainingMs, status, runId, finishedAway, start, pause, reset, setTime, addTime };
}
