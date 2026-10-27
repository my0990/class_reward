// 관리자 대시보드 '기능 사용량'
// ① 최근 7일·30일 사용 횟수와 쓴 반 수, 30일 일별 추이 (admins.feature_usage — 기능을 쓸 때마다 +1)
// ② 지금까지 설정해 둔 반 수 (이미 있는 데이터로: 자리 저장, 퀘스트, 아이템, 키오스크 연결, 승인 요청)
//    → ①은 기록을 시작한 날부터 쌓이므로, 처음에는 ②로 퍼진 정도를 본다
import { connectDB } from "@/lib/mongodb";
import { dayKey } from "@/lib/stats/dailyUsage";
import { FEATURES, FEATURE_KEYS } from "@/lib/stats/featureList";

const DAY = 24 * 60 * 60 * 1000;

/** 오늘을 포함한 최근 n일의 날짜 키 (오래된 것부터) */
const lastDays = (now, n) => Array.from({ length: n }, (_, i) => dayKey(new Date(now.getTime() - (n - 1 - i) * DAY)));

/**
 * @param {{ client?: import("mongodb").MongoClient, now?: Date }} [p]
 */
export async function getFeatureUsageService({ client, now = new Date() } = {}) {
  const c = client ?? (await connectDB);
  const admins = c.db("admins");
  const data = c.db("data");
  const user = c.db("user");

  const days30 = lastDays(now, 30);
  const days7 = new Set(days30.slice(-7));

  const [docs, activeClassDocs] = await Promise.all([
    admins.collection("feature_usage").find({ day: { $gte: days30[0] } }, { projection: { day: 1, feature: 1, count: 1, classes: 1 } }).toArray(),
    data.collection("classes").find({ deletedAt: { $exists: false } }, { projection: { _id: 1 } }).toArray(),
  ]);

  const items = FEATURE_KEYS.map((key) => {
    const byDay = new Map();
    const cls7 = new Set();
    const cls30 = new Set();
    let c7 = 0;
    let c30 = 0;
    for (const d of docs) {
      if (d.feature !== key) continue;
      byDay.set(d.day, (byDay.get(d.day) ?? 0) + (d.count ?? 0));
      c30 += d.count ?? 0;
      for (const id of d.classes ?? []) cls30.add(id);
      if (days7.has(d.day)) {
        c7 += d.count ?? 0;
        for (const id of d.classes ?? []) cls7.add(id);
      }
    }
    return {
      key,
      label: FEATURES[key].label,
      client: Boolean(FEATURES[key].client),
      count7: c7,
      count30: c30,
      classes7: cls7.size,
      classes30: cls30.size,
      series: days30.map((day) => ({ day, count: byDay.get(day) ?? 0 })),
    };
  });

  // ② 지금까지 설정해 둔 반 (휴지통에 있는 반은 빼고)
  const activeIds = activeClassDocs.map((d) => d._id);
  const inActive = { $in: activeIds };
  const distinctCount = async (col, field, filter = {}) => (await col.distinct(field, { ...filter, [field]: inActive })).length;
  const [seat, quest, items_, kiosk, requests] = await Promise.all([
    data.collection("class_data").countDocuments({ classId: inActive, "seatPlan.current": { $exists: true } }),
    distinctCount(data.collection("quest"), "classId"),
    data.collection("class_data").countDocuments({ classId: inActive, "itemList.0": { $exists: true } }),
    distinctCount(user.collection("kiosk_devices"), "classId", { revokedAt: { $exists: false } }),
    distinctCount(data.collection("requests"), "classId"),
  ]);

  return {
    since: docs.length ? docs.reduce((m, d) => (d.day < m ? d.day : m), docs[0].day) : null,
    activeClasses: activeIds.length,
    items,
    adoption: [
      { label: "자리를 저장한 반", count: seat },
      { label: "퀘스트를 만든 반", count: quest },
      { label: "아이템을 등록한 반", count: items_ },
      { label: "키오스크를 연결한 반", count: kiosk },
      { label: "승인 요청이 있었던 반 (최근 60일)", count: requests },
    ],
  };
}
