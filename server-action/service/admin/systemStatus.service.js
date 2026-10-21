// 관리자 대시보드: DB 용량 + Vercel 배포 상태 (개인 정보 없음, 크기·개수·커밋 정보만)
import { connectDB } from "@/lib/mongodb";
import { dayKey } from "@/lib/stats/dailyUsage";
import { lastDayKeys } from "@/server-action/service/admin/dashboard.service";

export const DB_LIMIT_BYTES = 512 * 1024 * 1024; // Atlas 무료(M0) 저장 한도
export const DB_NAMES = ["user", "data", "admins"];
const TOP_COLLECTIONS = 8;

/**
 * DB 용량: DB별·컬렉션별 크기, 한도 대비 %, 최근 30일 추이.
 * 대시보드를 열 때마다 오늘 숫자를 admins.db_size에 남긴다 (그날 마지막 값) → 추이 그래프.
 * 대시보드를 열지 않은 날은 빈 칸으로 보인다.
 */
export async function getDbUsageService({ now = new Date() } = {}) {
  const client = await connectDB;

  const dbs = await Promise.all(
    DB_NAMES.map(async (name) => {
      const s = await client.db(name).stats();
      return {
        name,
        dataSize: s.dataSize ?? 0,
        storageSize: s.storageSize ?? 0,
        indexSize: s.indexSize ?? 0,
        objects: s.objects ?? 0,
      };
    })
  );
  const totalBytes = dbs.reduce((a, d) => a + d.storageSize + d.indexSize, 0);

  // 컬렉션별 크기 (지원하지 않는 환경이면 건너뜀)
  const collections = [];
  await Promise.all(
    DB_NAMES.map(async (dbName) => {
      const db = client.db(dbName);
      const list = await db.listCollections({}, { nameOnly: true }).toArray().catch(() => []);
      await Promise.all(
        list
          .filter((c) => !c.name.startsWith("system."))
          .map(async ({ name }) => {
            const [st] = await db
              .collection(name)
              .aggregate([{ $collStats: { storageStats: {} } }])
              .toArray()
              .catch(() => [null]);
            const ss = st?.storageStats;
            if (!ss) return;
            collections.push({
              name: `${dbName}.${name}`,
              count: ss.count ?? 0,
              bytes: (ss.storageSize ?? 0) + (ss.totalIndexSize ?? 0),
            });
          })
      );
    })
  );
  collections.sort((a, b) => b.bytes - a.bytes);

  // 오늘 숫자 기록 + 최근 30일 추이
  const sizes = client.db("admins").collection("db_size");
  await sizes.updateOne({ _id: dayKey(now) }, { $set: { bytes: totalBytes } }, { upsert: true }).catch(() => {});
  const keys = lastDayKeys(now);
  const docs = await sizes.find({ _id: { $gte: keys[0] } }).toArray();
  const byDay = new Map(docs.map((d) => [d._id, d.bytes]));

  return {
    limitBytes: DB_LIMIT_BYTES,
    totalBytes,
    percent: Math.round((totalBytes / DB_LIMIT_BYTES) * 1000) / 10,
    dbs,
    collections: collections.slice(0, TOP_COLLECTIONS),
    trend: keys.map((key) => ({ key, bytes: byDay.get(key) ?? null })),
  };
}

/** Vercel 배포 목록 API 응답 → 화면에 필요한 칸만 */
export function mapDeployments(json) {
  return (json?.deployments ?? []).map((d) => ({
    id: d.uid,
    state: d.state ?? d.readyState ?? "UNKNOWN",
    target: d.target ?? null,
    createdAt: new Date(d.created ?? d.createdAt ?? 0).toISOString(),
    sha: d.meta?.githubCommitSha ? String(d.meta.githubCommitSha).slice(0, 7) : null,
    message: d.meta?.githubCommitMessage ? String(d.meta.githubCommitMessage).split("\n")[0] : null,
    ref: d.meta?.githubCommitRef ?? null,
  }));
}

/**
 * 배포 상태
 * - running: 지금 이 화면을 보여준 서버의 커밋 (Vercel이 자동으로 넣어주는 환경변수)
 * - recent: 최근 production 배포 5개 (VERCEL_API_TOKEN, VERCEL_PROJECT_ID가 있을 때만)
 */
export async function getDeployStatusService({ env = process.env, fetchImpl = fetch } = {}) {
  const running = env.VERCEL_GIT_COMMIT_SHA
    ? {
        sha: env.VERCEL_GIT_COMMIT_SHA.slice(0, 7),
        message: (env.VERCEL_GIT_COMMIT_MESSAGE ?? "").split("\n")[0] || null,
        ref: env.VERCEL_GIT_COMMIT_REF ?? null,
        env: env.VERCEL_ENV ?? null,
      }
    : null;

  if (!env.VERCEL_API_TOKEN || !env.VERCEL_PROJECT_ID) {
    return { running, recent: null, configured: false, error: null };
  }

  const params = new URLSearchParams({ projectId: env.VERCEL_PROJECT_ID, limit: "5", target: "production" });
  if (env.VERCEL_TEAM_ID) params.set("teamId", env.VERCEL_TEAM_ID);
  try {
    const res = await fetchImpl(`https://api.vercel.com/v6/deployments?${params}`, {
      headers: { Authorization: `Bearer ${env.VERCEL_API_TOKEN}` },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      return { running, recent: null, configured: true, error: `Vercel 응답 ${res.status} (토큰·프로젝트 ID 확인)` };
    }
    return { running, recent: mapDeployments(await res.json()), configured: true, error: null };
  } catch (error) {
    console.error("getDeployStatusService error:", error?.name);
    return { running, recent: null, configured: true, error: "Vercel에 연결하지 못했습니다." };
  }
}
