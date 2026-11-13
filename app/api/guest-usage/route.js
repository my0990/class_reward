// 비회원 도구(/tools) 사용 알림 받기 (lib/stats/trackGuest) → admins.feature_usage
// 로그인 없이 받으므로: 정해 둔 비회원 항목만, 같은 곳에서 너무 많이 오면 무시 (숫자 부풀리기 막기)
// IP는 이 서버 메모리에서 잠깐 세는 데만 쓰고 저장하지 않는다.
import { NextResponse } from "next/server";
import { GUEST_FEATURE_KEYS } from "@/lib/stats/featureList";
import { recordFeatureUse } from "@/lib/stats/featureUsage";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 60; // 10분에 60번까지 (교실에서 자리 섞기·타이머를 여러 번 눌러도 충분)
const hits = new Map(); // ip → { start, n }

function tooMany(ip, now = Date.now()) {
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v.start > WINDOW_MS) hits.delete(k); // 오래된 것 정리
  const h = hits.get(ip);
  if (!h || now - h.start > WINDOW_MS) {
    hits.set(ip, { start: now, n: 1 });
    return false;
  }
  h.n += 1;
  return h.n > MAX_PER_WINDOW;
}

export async function POST(req) {
  try {
    const text = await req.text();
    if (text.length > 200) return new NextResponse(null, { status: 413 });
    const feature = JSON.parse(text)?.feature;
    if (!GUEST_FEATURE_KEYS.includes(feature)) return new NextResponse(null, { status: 400 });
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    if (tooMany(ip)) return new NextResponse(null, { status: 429 });
    await recordFeatureUse(feature);
  } catch {
    /* 잘못된 요청은 조용히 무시 */
  }
  return new NextResponse(null, { status: 204 });
}
