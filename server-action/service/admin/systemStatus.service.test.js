import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo } = await import("@/test/helpers/testMongo");
const { getDbUsageService, mapDeployments, getDeployStatusService, DB_LIMIT_BYTES } = await import("./systemStatus.service.js");

const mongo = setupTestMongo();
const NOW = new Date("2026-10-21T03:00:00Z");

beforeEach(async () => {
  await mongo.client.db("admins").collection("db_size").deleteMany({});
});

describe("DB 용량", () => {
  it("크기를 합치고, 오늘 숫자를 남겨 추이로 보여준다", async () => {
    await mongo.db.collection("history").insertMany(Array.from({ length: 20 }, (_, i) => ({ i, memo: "x".repeat(200) })));
    await mongo.client.db("admins").collection("db_size").insertOne({ _id: "2026-10-20", bytes: 123 });

    const u = await getDbUsageService({ now: NOW });
    expect(u.limitBytes).toBe(DB_LIMIT_BYTES);
    expect(u.totalBytes).toBe(u.dbs.reduce((a, d) => a + d.storageSize + d.indexSize, 0));
    expect(u.dbs.map((d) => d.name)).toEqual(["user", "data", "admins"]);
    expect(u.collections.find((c) => c.name === "data.history")?.count).toBe(20);

    expect(u.trend).toHaveLength(30);
    expect(u.trend.at(-1)).toEqual({ key: "2026-10-21", bytes: u.totalBytes });
    expect(u.trend.at(-2)).toEqual({ key: "2026-10-20", bytes: 123 });
    expect(u.trend.at(-3).bytes).toBeNull();
  });
});

describe("배포 상태", () => {
  const sample = {
    deployments: [
      {
        uid: "dpl_1",
        state: "READY",
        target: "production",
        created: Date.parse("2026-10-21T01:00:00Z"),
        meta: { githubCommitSha: "abcdef1234567", githubCommitMessage: "첫 줄\n둘째 줄", githubCommitRef: "master" },
      },
      { uid: "dpl_2", readyState: "ERROR", createdAt: Date.parse("2026-10-20T01:00:00Z") },
    ],
  };

  it("필요한 칸만 꺼낸다", () => {
    expect(mapDeployments(sample)).toEqual([
      { id: "dpl_1", state: "READY", target: "production", createdAt: "2026-10-21T01:00:00.000Z", sha: "abcdef1", message: "첫 줄", ref: "master" },
      { id: "dpl_2", state: "ERROR", target: null, createdAt: "2026-10-20T01:00:00.000Z", sha: null, message: null, ref: null },
    ]);
    expect(mapDeployments(null)).toEqual([]);
  });

  it("토큰이 없으면 Vercel을 부르지 않고, 실행 중인 커밋만 보여준다", async () => {
    const fetchImpl = vi.fn();
    const r = await getDeployStatusService({ env: { VERCEL_GIT_COMMIT_SHA: "1234567890", VERCEL_GIT_COMMIT_MESSAGE: "msg" }, fetchImpl });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(r).toMatchObject({ configured: false, recent: null, running: { sha: "1234567", message: "msg" } });
  });

  it("토큰이 있으면 최근 배포를 가져오고, 실패해도 화면은 뜬다", async () => {
    const env = { VERCEL_API_TOKEN: "t", VERCEL_PROJECT_ID: "p", VERCEL_TEAM_ID: "team" };
    const ok = vi.fn(async () => ({ ok: true, json: async () => sample }));
    const r = await getDeployStatusService({ env, fetchImpl: ok });
    expect(ok.mock.calls[0][0]).toContain("projectId=p");
    expect(ok.mock.calls[0][0]).toContain("teamId=team");
    expect(ok.mock.calls[0][1].headers.Authorization).toBe("Bearer t");
    expect(r.recent).toHaveLength(2);

    const bad = await getDeployStatusService({ env, fetchImpl: async () => ({ ok: false, status: 403 }) });
    expect(bad).toMatchObject({ recent: null, error: expect.stringContaining("403") });
    const down = await getDeployStatusService({ env, fetchImpl: async () => { throw new Error("x"); } });
    expect(down.error).toBe("Vercel에 연결하지 못했습니다.");
  });
});
