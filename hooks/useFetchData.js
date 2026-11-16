// /hooks/useFetchData.js
"use client";

import useSWR from "swr";

const fetcher = async (url) => {
  const res = await fetch(url);

  let body = null;
  let parsed = true;

  try {
    body = await res.json();
  } catch {
    body = null;
    parsed = false;
  }

  // 200인데 JSON이 아님 (응답이 중간에 잘림, 와이파이 로그인 페이지, 일부 앱 내장 브라우저 등)
  // → 예전엔 data가 null이 되어 화면이 '불러오는 중'도 '오류'도 아닌 채로 null을 읽다 멈췄다. 오류로 처리해 다시 시도하게 한다
  if (res.ok && !parsed) {
    const error = new Error("서버 응답을 읽지 못했습니다. 잠시 후 다시 시도해 주세요.");
    error.status = res.status;
    throw error;
  }

  if (!res.ok) {
    const error = new Error(
      body?.error || body?.message || "데이터 요청 중 오류가 발생했습니다."
    );

    error.status = res.status;
    error.info = body;
    throw error;
  }

  return body;
};

export function useFetchData(url, options = {}) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(url || null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    ...options,
  });

  return {
    data,
    error,
    isError: Boolean(error),
    isLoading,
    isValidating,
    mutate,
  };
}

// 다른 기기(키오스크, 학생 태블릿)에서 바뀐 값을 화면에 반영하기 위한 새로고침 설정.
// 탭이 숨겨져 있을 때는 새로고침하지 않는다 (SWR 기본값 refreshWhenHidden: false).

/** 교사 화면용: 학생 잔액·온도계처럼 수업 중 계속 바뀌는 값. 15초마다 + 창으로 돌아올 때 */
export const LIVE_REFRESH = {
  refreshInterval: 15_000,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
};

/** 학생 화면용: 학생 수가 많아서 서버 부담을 줄이려고 1분마다 + 창으로 돌아올 때 */
export const STUDENT_REFRESH = {
  refreshInterval: 60_000,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
};
