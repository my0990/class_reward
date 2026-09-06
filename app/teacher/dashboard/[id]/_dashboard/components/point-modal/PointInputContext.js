"use client";

import { createContext, useContext } from "react";

// point-modal 트리(PointModal -> DialPad -> DialBtn) 전체가 공유하는
// 입력 상태(display)와 액션(actions)을 한 곳에서 내려주기 위한 Context.
// PointModal이 매번 display/actions를 props로 릴레이하지 않도록 한다.
const PointInputContext = createContext(null);

export function PointInputProvider({ display, actions, children }) {
  return (
    <PointInputContext.Provider value={{ display, actions }}>
      {children}
    </PointInputContext.Provider>
  );
}

export function usePointInputContext() {
  const ctx = useContext(PointInputContext);
  if (!ctx) {
    throw new Error(
      "usePointInputContext는 PointInputProvider 내부에서만 사용할 수 있습니다."
    );
  }
  return ctx;
}
