"use client";
// 목록 ↔ 상세를 주소(?id=...)로 표시한다 → 브라우저·태블릿의 뒤로가기로 목록에 돌아오고, 새로고침해도 상세가 유지된다
//   const detail = useDetailParam("id");
//   detail.value  // 지금 열린 상세 id (없으면 null)
//   detail.open(id) / detail.close()
// - 이 화면에서 연 상세를 닫으면 '뒤로가기'와 똑같이 (기록이 쌓이지 않게)
// - 주소로 바로 들어온 상세(새로고침 등)를 닫으면 주소만 목록으로 바꾼다
// - 목록으로 돌아오면 보던 스크롤 위치로
// ※ useSearchParams를 쓰므로 이 훅을 쓰는 화면은 <Suspense>로 감싼다
import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useDetailParam(name = "id") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(name) || null;
  const openedHere = useRef(false);
  const scrollKey = `kkyul:list-scroll:${pathname}`;

  const urlWith = useCallback(
    (v) => {
      const q = new URLSearchParams(searchParams.toString());
      if (v) q.set(name, v);
      else q.delete(name);
      const s = q.toString();
      return s ? `${pathname}?${s}` : pathname;
    },
    [searchParams, pathname, name]
  );

  const open = useCallback(
    (id) => {
      try {
        sessionStorage.setItem(scrollKey, String(window.scrollY));
      } catch {
        /* 저장 못 해도 괜찮음 */
      }
      openedHere.current = true;
      router.push(urlWith(String(id)), { scroll: false });
    },
    [router, urlWith, scrollKey]
  );

  const close = useCallback(() => {
    if (openedHere.current) {
      openedHere.current = false;
      router.back();
    } else {
      router.replace(urlWith(null), { scroll: false });
    }
  }, [router, urlWith]);

  // 상세로 가면 맨 위, 목록으로 돌아오면 보던 자리
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current && !value) {
      let y = 0;
      try {
        y = Number(sessionStorage.getItem(scrollKey)) || 0;
      } catch {
        /* 없으면 맨 위 */
      }
      requestAnimationFrame(() => window.scrollTo(0, y));
    } else if (!prev.current && value) {
      window.scrollTo(0, 0);
    }
    prev.current = value;
  }, [value, scrollKey]);

  return { value, open, close };
}
