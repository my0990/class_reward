// 지금 보고 있는 화면 주소에서 학급 id만 바꾼다.
// 예) /teacher/dashboard/AAA/quest → /teacher/dashboard/BBB/quest  (보던 메뉴 유지)
// 학급 id가 주소에 없으면 그 학급의 대시보드 첫 화면으로 보낸다.
export function switchClassPath(pathname, fromClassId, toClassId, role = "teacher") {
  const fallback = `/${role}/dashboard/${toClassId}`;
  if (!pathname || !fromClassId) return fallback;

  const marker = `/dashboard/${fromClassId}`;
  const idx = pathname.indexOf(marker);
  if (idx === -1) return fallback;

  const rest = pathname.slice(idx + marker.length);
  // 정확히 학급 id 경계에서 끝나는지 확인 (AAA가 AAAB의 앞부분인 경우 방지)
  if (rest !== "" && !rest.startsWith("/")) return fallback;

  return pathname.slice(0, idx) + `/dashboard/${toClassId}` + rest;
}
