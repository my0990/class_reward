"use client";
// 로그인 화면과 같은 귤 애니메이션(kkyul-hello.json)을 둥근 틀 안에. size(px) 원 안에 귤만 보이게
// 애니메이션을 받기 전·움직임 줄이기 설정이면 앱 아이콘
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("react-lottie-player"), { ssr: false });

export default function KkyulHello({ size = 160, className = "" }) {
  const [json, setJson] = useState(null);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    let alive = true;
    fetch("/kkyul-hello.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && j && setJson(j))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  // 로티(500×500) 중 귤이 보이는 곳은 가운데 지름 300 → 틀 크기의 5/3로 그려 가운데만 (로그인 화면과 같은 비율)
  const inner = Math.round((size * 5) / 3);
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {json ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: inner, height: inner }}>
          <Lottie loop play animationData={json} style={{ width: inner, height: inner }} />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/icons/icon-192x192.png" alt="" width={size} height={size} className="h-full w-full object-cover" />
      )}
    </div>
  );
}
