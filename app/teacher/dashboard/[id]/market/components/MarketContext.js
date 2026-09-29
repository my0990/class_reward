"use client";

import { createContext, useContext } from "react";

// market 트리(Market.container -> AddModal/DeleteModal)가 공유하는 상태와
// 액션을 한 곳에서 내려주기 위한 Context.
// 컨테이너가 모달마다 다른 조합의 props를 일일이 릴레이하지 않도록 한다.
const MarketContext = createContext(null);

export function MarketProvider({ value, children }) {
  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarketContext() {
  const ctx = useContext(MarketContext);
  if (!ctx) {
    throw new Error("useMarketContext는 MarketProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
