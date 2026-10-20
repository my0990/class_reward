// 용량·사용량 통계 (읽기 전용, 개수·크기만 출력 — 개인정보 없음)
//
//   node scripts/db/stats.mjs      (npm run db:stats)
import { connect } from "./_common.mjs";

const client = await connect();
const MB = (b) => `${(b / 1024 / 1024).toFixed(2)}MB`;
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

try {
  console.log("## DB 용량 (Atlas 무료 M0 한도: 512MB)");
  let total = 0;
  for (const name of ["user", "data", "admins"]) {
    const s = await client.db(name).stats();
    total += (s.storageSize ?? 0) + (s.indexSize ?? 0);
    console.log(`- ${name}: 데이터 ${MB(s.dataSize)} / 저장 ${MB(s.storageSize)} / 인덱스 ${MB(s.indexSize)} / 문서 ${s.objects}개`);
  }
  console.log(`- 합계(저장+인덱스): ${MB(total)}`);

  console.log("\n## 컬렉션별 (문서 수 · 평균 크기)");
  for (const name of ["user", "data", "admins"]) {
    const db = client.db(name);
    for (const { name: c } of await db.listCollections().toArray()) {
      const [st] = await db.collection(c).aggregate([{ $collStats: { storageStats: {} } }]).toArray().catch(() => [null]);
      const ss = st?.storageStats;
      console.log(`- ${name}.${c}: ${ss?.count ?? "?"}개, 평균 ${ss?.avgObjSize ? (ss.avgObjSize / 1024).toFixed(1) + "KB" : "-"}, 저장 ${ss ? MB(ss.storageSize) : "?"}`);
    }
  }

  const users = client.db("user").collection("users");
  console.log("\n## 사용자");
  const c = (q) => users.countDocuments(q);
  console.log(`- 교사 ${await c({ role: "teacher" })}명 / 학생 ${await c({ role: "student" })}명 / 학급 ${await client.db("data").collection("classes").countDocuments({ deletedAt: { $exists: false } })}개`);
  for (const d of [1, 7, 30]) {
    const since = new Date(now - d * DAY);
    console.log(`- 최근 ${d}일 접속: 교사 ${await c({ role: "teacher", lastSeenAt: { $gte: since } })}명, 학생 ${await c({ role: "student", lastSeenAt: { $gte: since } })}명`);
  }

  console.log("\n## 최근 14일 (일별)");
  const usage = await client.db("admins").collection("daily_usage").find({}).sort({ _id: -1 }).limit(14).toArray();
  for (const u of usage) console.log(`- ${u._id}: 교사 ${u.teachers ?? 0} · 학생 ${u.students ?? 0} · 키오스크 ${u.kioskUses ?? 0}`);
  const hist = await client.db("data").collection("history").aggregate([
    { $match: { expiresAfter: { $gte: new Date(now - 14 * DAY), $type: "date" } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$expiresAfter", timezone: "Asia/Seoul" } }, n: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]).toArray();
  console.log("- 화폐·아이템 기록(history) 일별:", hist.map((h) => `${h._id.slice(5)} ${h.n}건`).join(", ") || "없음");
} finally {
  await client.close();
}
