import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireTeacher, parseIntParam, ApiError } from "@/lib/api/routeHelpers";

const HISTORY_PAGE_DEFAULT = 50;
const HISTORY_PAGE_MAX = 500;

// 학생 거래 내역 (담임 교사만)
export const GET = withApiHandler(async (req, { params }) => {
  const { teacherObjectId } = await requireTeacher();
  const { id: userId } = await params;
  // 최근 것부터 limit건만 준다 (기본 50, 최대 500). 화면의 "더 보기"가 limit을 늘려서 다시 요청한다.
  const limit = parseIntParam(new URL(req.url).searchParams.get("limit"), {
    defaultValue: HISTORY_PAGE_DEFAULT,
    min: 1,
    max: HISTORY_PAGE_MAX,
  });

  const db = (await connectDB).db("data");

  // ✅ 이 요청을 보낸 교사가 실제로 이 학생의 담임인지 확인한다.
  const student = await db.collection("user_data").findOne(
    { userId, teacher_id: teacherObjectId, role: "student" },
    { projection: { _id: 1, classId: 1 } }
  );
  if (!student) throw new ApiError(403, "조회 권한이 없습니다.");

  // 기록도 이 교사·학급 것만 (teacher_id가 없는 예전 형식 기록은 아이디로)
  const history = await db
    .collection("history")
    .find(
      {
        userId,
        $or: [
          { teacher_id: teacherObjectId, classId: student.classId },
          { teacher_id: { $exists: false } },
        ],
      },
      { projection: { code: 0 } }
    )
    .sort({ date: -1, _id: -1 })
    .limit(limit)
    .toArray();

  return NextResponse.json(history);
});
