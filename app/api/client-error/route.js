// 브라우저 에러 신고 받기 (lib/errorLog/reportClientError) → admins.error_logs
// 로그인 전 화면 에러도 받아야 해서 로그인 확인은 하지 않는다. 대신 크기 제한 + 하루 새 종류 상한(errorLog).
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { withApiHandler, ApiError } from "@/lib/api/routeHelpers";
import { recordError } from "@/lib/errorLog/errorLog";
import { CLIENT_SOURCES } from "@/lib/errorLog/errorCore";

const MAX_BODY = 8_000;

export const POST = withApiHandler(async (req) => {
  const text = await req.text();
  if (text.length > MAX_BODY) throw new ApiError(413, "너무 큽니다.");
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new ApiError(400, "잘못된 요청입니다.");
  }
  if (!body || typeof body !== "object") throw new ApiError(400, "잘못된 요청입니다.");

  const session = await getServerSession(authOptions).catch(() => null);
  await recordError({
    source: CLIENT_SOURCES.includes(body.source) ? body.source : "client",
    message: typeof body.message === "string" ? body.message : "",
    stack: typeof body.stack === "string" ? body.stack : "",
    path: typeof body.path === "string" ? body.path : "",
    digest: typeof body.digest === "string" ? body.digest : null,
    role: session?.user?.role ?? "guest",
  });
  return new NextResponse(null, { status: 204 });
});
