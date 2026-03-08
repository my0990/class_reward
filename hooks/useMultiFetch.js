// /hooks/useMultiFetch.js
"use client";

import { fetchData } from "./swrHooks";

export default function useMultiFetch(requests) {
  // requests: [{ key, url }]
  const results = Object.fromEntries(
    requests.map(({ key, url }) => [key, fetchData(url)])
  );

  const isLoading = Object.values(results).some((r) => r.isLoading);
  const isError = Object.values(results).some((r) => r.isError);

  const data = Object.fromEntries(
    Object.entries(results).map(([k, r]) => [k, r.data])
  );

  return { data, results, isLoading, isError };
}