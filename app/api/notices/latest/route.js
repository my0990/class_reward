import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler } from "@/lib/api/routeHelpers";

// 헤더의 "새 공지" 표시용: 가장 최근에 올라온 공지의 작성 시각만 돌려준다 (로그인 불필요, 공지 목록과 같음)
export const GET = withApiHandler(async () => {
  const db = (await connectDB).db("admins");
  const latest = await db
    .collection("notices")
    .find({}, { projection: { createdAt: 1 } })
    .sort({ createdAt: -1 })
    .limit(1)
    .next();
  return NextResponse.json({ latestAt: latest?.createdAt ? new Date(latest.createdAt).toISOString() : null });
});
