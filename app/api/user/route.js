import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireMember, parseObjectId } from "@/lib/api/routeHelpers";

// 로그인한 사용자 본인의 user_data
// - 교사: userId = 이메일 (회원가입 시 이렇게 저장됨)
// - 학생: userId + 담임 교사 + 학급으로 스코핑
export const GET = withApiHandler(async () => {
  const { session, role, teacherObjectId } = await requireMember();

  const filter =
    role === "teacher"
      ? { userId: session.user.email }
      : {
          userId: session.user.userId,
          role: "student",
          teacher_id: teacherObjectId,
          classId: parseObjectId(session.user.classId, "세션"),
        };

  const db = (await connectDB).db("data");
  const userData = await db.collection("user_data").findOne(filter);

  if (!userData) {
    return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(userData);
});
