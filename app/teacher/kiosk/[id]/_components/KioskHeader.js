"use client";
// 키오스크 화면 상단 바: [‹ 이전]  제목 (새로고침)  [처음으로]
import { useState } from "react";
import Link from "next/link";

export const kioskHome = (classId) => `/teacher/kiosk/${classId}`;

export function RefreshButton({ onClick }) {
  const [rotation, setRotation] = useState(0);
  return (
    <button
      type="button"
      aria-label="새로고침"
      onClick={() => {
        setRotation((r) => r + 360);
        onClick();
      }}
      style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0.5s ease-in-out" }}
      className="p-1 hover:scale-105"
    >
      <svg width="32" height="32" viewBox="0 0 21 21" fill="none" aria-hidden="true">
        <g fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="matrix(0 1 1 0 2.5 2.5)">
          <path d="m3.98652376 1.07807068c-2.38377179 1.38514556-3.98652376 3.96636605-3.98652376 6.92192932 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8" />
          <path d="m4 1v4h-4" transform="matrix(1 0 0 -1 0 6)" />
        </g>
      </svg>
    </button>
  );
}

/**
 * @param {{ classId: string, title: string, onBack?: () => void, showHome?: boolean, onRefresh?: () => void }} props
 * onBack이 없으면 키오스크 첫 화면으로 간다.
 */
export default function KioskHeader({ classId, title, onBack, showHome = true, onRefresh }) {
  const link = "flex items-center text-[2rem] transition-all hover:scale-110";
  const back = (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true">
        <path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" />
      </svg>
      이전
    </>
  );

  return (
    <div className="grid h-[64px] grid-cols-[1fr_auto_1fr] items-center">
      <div className="justify-self-start">
        {onBack ? (
          <button type="button" onClick={onBack} className={link}>{back}</button>
        ) : (
          <Link href={kioskHome(classId)} className={link}>{back}</Link>
        )}
      </div>
      <div className="flex items-center gap-3">
        <h1 className="text-[2rem]">{title}</h1>
        {onRefresh && <RefreshButton onClick={onRefresh} />}
      </div>
      <div className="justify-self-end">
        {showHome && (
          <Link href={kioskHome(classId)} className={link}>처음으로</Link>
        )}
      </div>
    </div>
  );
}
