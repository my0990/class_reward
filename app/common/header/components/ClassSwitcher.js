"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useFetchData } from "@/hooks/useFetchData";
import { switchClassPath } from "../utils/classPath";

// 교사용 헤더 왼쪽: 학급 이름(누르면 대시보드) + ▾(누르면 다른 학급 목록)
// 다른 학급을 고르면 보던 메뉴를 유지한 채 학급만 바꾼다.
export default function ClassSwitcher({ classId, className, homeHref }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const closeTimer = useRef(null);
  const openedByHover = useRef(false); // 마우스로 열린 상태에서 ▾를 클릭해도 닫히지 않게

  // 마우스: ▾에 올리면 열리고, ▾와 목록 밖으로 나가면 0.2초 뒤 닫힌다 (목록으로 옮겨가는 사이 안 닫히게).
  // 터치(태블릿·휴대폰)는 hover가 없으므로 기존처럼 눌러서 연다.
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const onHoverEnter = (e) => {
    if (e.pointerType !== "mouse") return;
    cancelClose();
    openedByHover.current = true;
    setOpen(true);
  };
  const onHoverLeave = (e) => {
    if (e.pointerType !== "mouse") return;
    cancelClose();
    closeTimer.current = setTimeout(() => {
      openedByHover.current = false;
      setOpen(false);
    }, 200);
  };
  useEffect(() => cancelClose, []);
  const pathname = usePathname();
  const router = useRouter();

  // 목록은 처음 펼칠 때 불러온다
  const { data: classes, isLoading, isError } = useFetchData(open ? "/api/classes" : null);

  // 바깥 클릭 / ESC로 닫기, 페이지 이동 시 닫기
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  useEffect(() => setOpen(false), [pathname]);

  const goTo = (targetId) => {
    setOpen(false);
    if (String(targetId) === String(classId)) return;
    router.push(switchClassPath(pathname, classId, targetId, "teacher"));
  };

  return (
    <div className="relative flex items-center" ref={boxRef}>
      <Link
        prefetch={false}
        href={homeHref}
        replace
        className="
          max-w-[200px] h-[56px] flex items-center
          text-[24px] font-extrabold text-orange-500
          hover:scale-105 transition-all duration-300
          overflow-hidden whitespace-nowrap text-ellipsis
        "
        title="대시보드로 가기"
      >
        {className}
      </Link>

      <button
        type="button"
        onClick={() => setOpen((v) => (openedByHover.current ? true : !v))}
        onPointerEnter={onHoverEnter}
        onPointerLeave={onHoverLeave}
        aria-label="다른 학급 선택"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="ml-[4px] rounded-full p-[4px] text-orange-500 hover:bg-orange-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`size-6 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          onPointerEnter={onHoverEnter}
          onPointerLeave={onHoverLeave}
          className="
            absolute left-0 top-full z-50 mt-[8px]
            min-w-[240px] max-h-[60vh] overflow-auto
            rounded-xl border-2 border-gray-200 bg-white shadow-lg
            text-[1rem] text-gray-700
          "
        >
          {isLoading && <div className="px-4 py-3 text-gray-400">불러오는 중...</div>}
          {isError && <div className="px-4 py-3 text-red-500">학급 목록을 불러오지 못했습니다.</div>}

          {(classes ?? []).map((cls) => {
            const isCurrent = String(cls._id) === String(classId);
            return (
              <button
                key={cls._id}
                type="button"
                role="option"
                aria-selected={isCurrent}
                onClick={() => goTo(cls._id)}
                className={`
                  flex w-full items-center justify-between gap-4 px-4 py-3 text-left
                  hover:bg-orange-50
                  ${isCurrent ? "font-bold text-orange-500" : ""}
                `}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="w-[16px]">{isCurrent ? "✓" : ""}</span>
                  <span className="truncate">{cls.className}</span>
                </span>
                <span className="shrink-0 text-sm text-gray-400">{cls.studentsCount ?? 0}명</span>
              </button>
            );
          })}

          <Link
            href="/teacher/classes"
            prefetch={false}
            className="block border-t-2 border-gray-100 px-4 py-3 text-gray-500 hover:bg-orange-50"
          >
            전체 학급 보기
          </Link>
        </div>
      )}
    </div>
  );
}
