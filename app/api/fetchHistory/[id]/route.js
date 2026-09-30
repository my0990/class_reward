import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireTeacher } from "@/lib/api/routeHelpers";

// 학생 거래 내역 (담임 교사만)
export const GET = withApiHandler(async (req, { params }) => {
  const { teacherObjectId } = await requireTeacher();
  const { id: userId } = await params;

  const db = (await connectDB).db("data");

  // ✅ 이 요청을 보낸 교사가 실제로 이 학생의 담임인지 확인한다.
  const owns = await db.collection("user_data").findOne(
    { userId, teacher_id: teacherObjectId, role: "student" },
    { projection: { _id: 1 } }
  );

  if (!owns) {
    return NextResponse.json({ error: "조회 권한이 없습니다." }, { status: 403 });
  }

  const history = await db
    .collection("history")
    .find({ userId }, { projection: { code: 0 } })
    .sort({ date: -1 })
    .toArray();

  return NextResponse.json(history);
});
