// /hooks/useFetchData.js
"use client";

import useSWR from "swr";

const fetcher = async (url) => {
  const res = await fetch(url);

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const error = new Error(body?.error || "데이터 요청 중 오류가 발생했습니다.");
    error.status = res.status;
    error.info = body;
    throw error;
  }

  return body;
};

export function useFetchData(url, options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    ...options,
  });

  return {
    data,
    error,
    isError: !!error,
    isLoading,
    isValidating,
    mutate,
  };
}