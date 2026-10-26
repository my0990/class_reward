"use client";
// 화면 어디서든 잡히지 않은 에러(스크립트 오류, 처리 안 된 Promise)를 신고한다. 루트 레이아웃에 하나.
import { useEffect } from "react";
import { reportClientError } from "@/lib/errorLog/reportClientError";

export default function ClientErrorReporter() {
  useEffect(() => {
    const onError = (ev) => reportClientError(ev.error ?? ev.message, { source: "client" });
    const onRejection = (ev) => reportClientError(ev.reason, { source: "client" });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
