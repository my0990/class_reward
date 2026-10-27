// Next.js가 서버에서 잡지 못한 에러(서버 컴포넌트, 라우트, 서버 액션)를 알려줄 때 → 에러 기록
// (각 액션의 catch에서 잡힌 에러는 logError가 따로 기록한다)
export async function onRequestError(error, request) {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { recordError, serverBuild } = await import("@/lib/errorLog/errorLog");
  const { summarizeUserAgent } = await import("@/lib/errorLog/errorCore");
  const ua = request?.headers?.["user-agent"];
  await recordError({
    source: "server",
    message: error?.message ?? String(error),
    stack: error?.stack,
    path: request?.path,
    digest: error?.digest,
    device: summarizeUserAgent(Array.isArray(ua) ? ua[0] : ua),
    build: serverBuild(),
  });
}
