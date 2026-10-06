"use client";
// 키오스크 첫 화면 아래쪽 "홈 화면에 추가" 안내
// - 안드로이드·크롬·엣지: 브라우저 설치 창을 띄우는 버튼 (beforeinstallprompt)
// - 아이폰·아이패드(사파리): 설치 창을 띄울 수 없어서 방법만 안내
// - 이미 홈 화면 앱으로 열었거나, '닫기'를 누른 지 7일이 안 됐으면 보이지 않는다
import { useEffect, useState } from "react";

const DISMISS_KEY = "kioskInstallDismissedAt";
const DISMISS_DAYS = 7;

function isInstalledApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true
  );
}

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at > 0 && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function isIOS() {
  const ua = navigator.userAgent;
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(ua) || iPadOS;
}

export default function KioskInstallPrompt() {
  const [mode, setMode] = useState(null); // null | "prompt" | "ios"
  const [deferred, setDeferred] = useState(null);

  useEffect(() => {
    if (isInstalledApp() || recentlyDismissed()) return;
    if (isIOS()) {
      setMode("ios");
      return;
    }
    const onBeforeInstall = (e) => {
      e.preventDefault(); // 브라우저 기본 안내 대신 우리 안내를 쓴다
      setDeferred(e);
      setMode("prompt");
    };
    const onInstalled = () => setMode(null);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mode) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setMode(null);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice.catch(() => null);
    setDeferred(null);
    setMode(null);
  };

  return (
    <div className="flex w-full max-w-[640px] items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-orange-900 shadow-lg">
      <div className="text-2xl" aria-hidden="true">📲</div>
      <div className="min-w-0 flex-1 text-sm font-bold sm:text-base">
        {mode === "prompt" ? (
          "홈 화면에 추가하면 주소창 없이 키오스크를 바로 열 수 있어요."
        ) : (
          <>
            홈 화면에 추가하려면 사파리 아래(아이패드는 위)의 <b>공유 버튼</b>을 누르고 <b>&lsquo;홈 화면에 추가&rsquo;</b>를 선택하세요.
          </>
        )}
      </div>
      {mode === "prompt" && (
        <button type="button" onClick={install} className="shrink-0 rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white">
          추가하기
        </button>
      )}
      <button type="button" onClick={dismiss} className="shrink-0 px-2 py-2 text-sm text-gray-500" aria-label="안내 닫기">
        닫기
      </button>
    </div>
  );
}
