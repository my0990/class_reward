import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, parseIntParam } from "@/lib/api/routeHelpers";
import { NOTICE_SORT } from "@/server-action/service/admin/notice.service";

// 공지 목록 (로그인 불필요): 고정 공지 먼저, limit은 최대 50개
export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseIntParam(searchParams.get("page"), { defaultValue: 1, min: 1, max: 10000 });
  const limit = parseIntParam(searchParams.get("limit"), { defaultValue: 5, min: 1, max: 50 });

  const col = (await connectDB).db("admins").collection("notices");
  const [notices, total] = await Promise.all([
    col.find().sort(NOTICE_SORT).skip((page - 1) * limit).limit(limit).toArray(),
    col.countDocuments(),
  ]);

  return NextResponse.json({
    // 관리자 이메일·고정 시각은 내보내지 않는다
    notices: notices.map(({ authorEmail, pinnedAt, ...n }) => ({ ...n, _id: n._id.toString() })),
    total,
    page,
    limit,
  });
});
