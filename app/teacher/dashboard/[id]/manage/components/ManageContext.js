"use client";

import { createContext, useContext } from "react";

// manage 트리(Manage.container -> StudentGrid/CreateModal/DeleteModal/ResetModal/DetailModal)가
// 공유하는 상태와 액션을 한 곳에서 내려주기 위한 Context.
// 컨테이너가 매번 모달마다 다른 조합의 props를 일일이 릴레이하지 않도록 한다.
const ManageContext = createContext(null);

export function ManageProvider({ value, children }) {
  return <ManageContext.Provider value={value}>{children}</ManageContext.Provider>;
}

export function useManageContext() {
  const ctx = useContext(ManageContext);
  if (!ctx) {
    throw new Error("useManageContext는 ManageProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
