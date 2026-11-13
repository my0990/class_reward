"use client";
// 비회원 도구 왼쪽 위 뀰 로고: 로그인 화면과 같은 귤 애니메이션(kkyul-hello.json)을 작게. 누르면 첫 화면으로
// 애니메이션을 불러오기 전·움직임 줄이기 설정에서는 앱 아이콘 그대로
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("react-lottie-player"), { ssr: false });

export default function KkyulLogo({ size = 64 }) {
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

  // 로티 그림(500×500)에서 귤이 보이는 곳은 가운데 지름 300 → 로고 크기의 5/3로 그려 가운데만 보이게 (로그인 화면의 둥근 틀과 같은 비율)
  const inner = Math.round((size * 5) / 3);
  return (
    <a
      href="/"
      title="뀰 — 학급 화폐·퀘스트·자리 바꾸기"
      aria-label="뀰 첫 화면"
      className="relative block shrink-0 overflow-hidden rounded-full bg-orange-50 shadow-sm ring-2 ring-orange-200 transition hover:scale-105"
      style={{ width: size, height: size }}
    >
      {json ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: inner, height: inner }}>
          <Lottie loop play animationData={json} style={{ width: inner, height: inner }} />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/icons/icon-128x128.png" alt="" width={size} height={size} className="h-full w-full object-cover" />
      )}
    </a>
  );
}
