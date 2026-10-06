import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, parseObjectId, ApiError } from "@/lib/api/routeHelpers";

// 공지 상세 (로그인 불필요)
export const GET = withApiHandler(async (req, { params }) => {
  const _id = parseObjectId((await params).id, "공지 id");
  const notice = await (await connectDB).db("admins").collection("notices").findOne({ _id });
  if (!notice) throw new ApiError(404, "공지를 찾을 수 없습니다.");

  const { authorEmail, pinnedAt, ...rest } = notice; // 관리자 이메일은 내보내지 않는다
  return NextResponse.json({ notice: { ...rest, _id: rest._id.toString() } });
});
