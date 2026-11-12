import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireMember, parseObjectId } from "@/lib/api/routeHelpers";
import { isAdminEmail, isAdminModeActive } from "@/lib/auth/adminAuth";

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

  // 선생님: 관리자 모드를 켤 수 있는 계정인지 / 지금 켜져 있는지 (헤더 프로필 메뉴)
  if (role === "teacher" && isAdminEmail(session.user.email)) {
    return NextResponse.json({ ...userData, canAdmin: true, adminActive: isAdminModeActive(session.user) });
  }
  return NextResponse.json(userData);
});
