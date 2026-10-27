// 서버 에러 기록 → admins.error_logs (관리자 대시보드 '최근 에러')
//
// - 같은 에러는 하루에 한 줄로 묶고 count만 올린다 (fp + day)
// - 새로운 종류는 하루 DAILY_NEW_CAP개까지만 (브라우저 신고를 악용해 DB를 채우지 못하게)
// - 30일 지나면 자동 삭제 (lastAt TTL, scripts/db/indexes.mjs)
// - 배포된 서버(production)에서만 기록한다. 개발 중 에러가 실제 DB에 쌓이지 않게.
// - 기록이 실패해도 원래 요청에는 영향 없음 (절대 throw하지 않음)
//
// DB 연결(lib/mongodb)은 기록할 때만 불러온다: routeHelpers가 이 파일을 쓰는데,
// 파일을 읽자마자 DB에 연결하면 DB 주소가 없는 테스트(requireAdmin 등)가 깨진다.
import { after } from "next/server";
import { maskText, cleanPath, errorFingerprint, isNoise, summarizeUserAgent, LIMITS, SOURCES } from "./errorCore";

export const ERROR_TTL_DAYS = 30;
export const DAILY_NEW_CAP = 300;
const ROLES = ["teacher", "student", "kiosk", "admin", "guest"];

const enabled = () => process.env.NODE_ENV === "production";

/** 지금 서버의 배포 버전 (커밋 앞 7자리, Vercel이 채워 줌) */
export const serverBuild = () => (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7) || null;

/**
 * @param {{ source?: string, message?: string, stack?: string, path?: string, digest?: string, role?: string, device?: string, build?: string }} input
 *   device: 브라우저·기기 요약 (summarizeUserAgent), build: 배포 버전 (커밋 앞 7자리)
 * @param {{ db?: import("mongodb").Db, now?: Date }} [opts] db = "admins" DB (테스트용)
 */
export async function recordError(input = {}, { db, now = new Date() } = {}) {
  try {
    if (!db && !enabled()) return { skipped: "disabled" };
    const source = SOURCES.includes(input.source) ? input.source : "server";
    const message = maskText(input.message).trim().slice(0, LIMITS.message) || "(메시지 없음)";
    const stack = maskText(input.stack).slice(0, LIMITS.stack);
    if (isNoise(message, stack)) return { skipped: "noise" };

    const { dayKey } = await import("@/lib/stats/dailyUsage");
    const adminsDb = db ?? (await (await import("@/lib/mongodb")).connectDB).db("admins");
    const col = adminsDb.collection("error_logs");
    const fp = errorFingerprint({ source, message, stack });
    const day = dayKey(now);
    const set = {
      lastAt: now,
      path: cleanPath(input.path) || null,
      role: ROLES.includes(input.role) ? input.role : null,
    };

    const device = input.device ? String(input.device).slice(0, 60) : null;
    const build = input.build && /^[0-9a-f]{7}$/i.test(String(input.build)) ? String(input.build).toLowerCase() : null;
    // 어떤 기기·버전에서 났는지 모아 둔다 (하루·종류마다라서 몇 개 안 됨)
    const addToSet = {};
    if (device) addToSet.devices = device;
    if (build) addToSet.builds = build;
    const bump = { $inc: { count: 1 }, $set: set, ...(Object.keys(addToSet).length ? { $addToSet: addToSet } : {}) };

    const r = await col.updateOne({ fp, day }, bump);
    if (r.matchedCount) return { ok: true, fp };

    if ((await col.countDocuments({ day })) >= DAILY_NEW_CAP) return { skipped: "cap" };
    try {
      await col.insertOne({
        fp,
        day,
        source,
        message,
        stack,
        digest: input.digest ? String(input.digest).slice(0, 100) : null,
        firstAt: now,
        count: 1,
        devices: device ? [device] : [],
        builds: build ? [build] : [],
        ...set,
      });
    } catch (e) {
      if (e?.code !== 11000) throw e;
      await col.updateOne({ fp, day }, bump); // 동시에 같은 에러가 들어온 경우
    }
    return { ok: true, fp };
  } catch (e) {
    console.error("[errorLog] 기록 실패:", e?.message);
    return { skipped: "error" };
  }
}

/** 응답을 보낸 뒤에 기록 (요청이 느려지지 않게). 요청 밖이면 그냥 실행 */
function later(task) {
  try {
    after(task);
  } catch {
    void task();
  }
}

/**
 * console.error 대신 쓰는 함수: 로그는 그대로 남기고, 에러 기록에도 저장한다.
 *   catch (error) { logError("createQuest error:", error); ... }
 */
export function logError(...args) {
  console.error(...args);
  const err = args.find((a) => a instanceof Error) ?? args.find((a) => a && typeof a === "object" && "message" in a);
  const label = args.filter((a) => typeof a === "string").join(" ").trim();
  const message = [label, err?.message].filter(Boolean).join(" ");
  later(async () => {
    // 서버 액션이면 요청한 브라우저 정보를 읽을 수 있다 (못 읽으면 빈칸)
    let device = null;
    try {
      const { headers } = await import("next/headers");
      device = summarizeUserAgent((await headers()).get("user-agent"));
    } catch {
      /* 요청 밖 */
    }
    return recordError({ source: "action", message, stack: err?.stack, digest: err?.digest, device, build: serverBuild() });
  });
}

/** API 라우트에서 예상 못 한 에러 (withApiHandler) */
export function logApiError(req, error) {
  const path = cleanPath(req?.url ?? "");
  console.error(`[api] ${req?.method ?? ""} ${path}`, error);
  later(() =>
    recordError({
      source: "api",
      message: `${req?.method ?? ""} ${error?.message ?? error}`,
      stack: error?.stack,
      path,
      digest: error?.digest,
      device: summarizeUserAgent(req?.headers?.get?.("user-agent")),
      build: serverBuild(),
    })
  );
}
