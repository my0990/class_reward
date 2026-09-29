import { useState, useRef, useCallback } from "react";

/**
 * 범용 중복 실행 방지 훅
 *
 * 특징
 * - action + id 기반 pending 관리
 * - id optional
 * - ref 기반 lock
 * - onSuccess / onError 지원
 */

export default function usePendingAction() {
  const [pendingKeys, setPendingKeys] = useState(new Set());

  // 빠른 중복 클릭 방지용
  const pendingRef = useRef(new Set());

  const makeKey = (action, id) =>
    id !== undefined ? `${action}-${id}` : action;

  /**
   * pending 상태 확인
   */
  const isPending = useCallback(
    (action, id) => {
      const key = makeKey(action, id);
      return pendingKeys.has(key);
    },
    [pendingKeys]
  );

  /**
   * 서버 요청 실행
   *
   * 사용
   * runAction("saveProfile", fn)
   * runAction("deleteStudent", id, fn)
   */
  const runAction = useCallback(async (action, idOrFn, maybeFnOrOptions, maybeOptions) => {
    // 지원하는 두 가지 호출 형태:
    //   runAction(action, fn, options?)          - id가 필요 없는 액션
    //   runAction(action, id, fn, options?)       - id로 구분해야 하는 액션
    const hasId = typeof idOrFn !== "function";
    const id = hasId ? idOrFn : undefined;
    const fn = hasId ? maybeFnOrOptions : idOrFn;
    const options = (hasId ? maybeOptions : maybeFnOrOptions) ?? {};

    const { onSuccess, onError } = options;

    const key = makeKey(action, id);

    // 이미 실행 중이면 차단
    if (pendingRef.current.has(key)) return;

    // lock
    pendingRef.current.add(key);

    setPendingKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

    try {
      const result = await fn();

      onSuccess?.(result);

      return result;
    } catch (err) {
      onError?.(err);
      throw err;
    } finally {
      pendingRef.current.delete(key);

      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, []);

  return {
    runAction,
    isPending,
    pendingKeys,
  };
}