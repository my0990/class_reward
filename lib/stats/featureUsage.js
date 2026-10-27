// 기능 사용량 세기 → admins.feature_usage
//   { _id: "2026-10-27:seat_confirm", day, feature, date, count, classes: [학급 id 문자열] }
// - 하루·기능마다 문서 하나: count +1, 쓴 학급 id만 모은다 (누가 썼는지는 남기지 않음, 화면에는 반 '개수'만)
// - 400일 지나면 자동 삭제 (date TTL, scripts/db/indexes.mjs)
// - 배포된 서버(production)에서만 센다. 기록이 실패해도 원래 작업에는 영향 없음
// - DB 연결은 셀 때만 불러온다 (파일을 읽자마자 연결하면 DB 주소 없는 테스트가 깨짐)
import { after } from "next/server";
import { isFeature } from "./featureList";

const HEX24 = /^[0-9a-f]{24}$/i;

export async function recordFeatureUse(feature, { classId, db, now = new Date() } = {}) {
  try {
    if (!isFeature(feature)) return { skipped: "unknown" };
    if (!db && process.env.NODE_ENV !== "production") return { skipped: "disabled" };
    const { dayKey } = await import("@/lib/stats/dailyUsage");
    const adminsDb = db ?? (await (await import("@/lib/mongodb")).connectDB).db("admins");
    const day = dayKey(now);
    const update = {
      $inc: { count: 1 },
      $setOnInsert: { day, feature, date: new Date(`${day}T00:00:00+09:00`) },
    };
    const cid = classId == null ? "" : String(classId);
    if (HEX24.test(cid)) update.$addToSet = { classes: cid.toLowerCase() };
    await adminsDb.collection("feature_usage").updateOne({ _id: `${day}:${feature}` }, update, { upsert: true });
    return { ok: true };
  } catch (e) {
    console.error("[featureUsage]", e?.message);
    return { skipped: "error" };
  }
}

/** server action 안에서: 응답을 보낸 뒤에 센다 (요청이 느려지지 않게) */
export function bumpFeature(feature, { classId } = {}) {
  if (process.env.NODE_ENV !== "production") return;
  const task = () => recordFeatureUse(feature, { classId });
  try {
    after(task);
  } catch {
    void task();
  }
}
