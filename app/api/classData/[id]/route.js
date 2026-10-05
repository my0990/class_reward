import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireMember, parseObjectId, requireActiveClass } from "@/lib/api/routeHelpers";

// 학급 설정/마켓/프로필 이미지 등 학급 정보 (교사 + 그 반 학생)
export const GET = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const classObjectId = parseObjectId(id, "학급 id");
  const { teacherObjectId } = await requireMember({ classId: id });
  await requireActiveClass(teacherObjectId, classObjectId);

  const db = (await connectDB).db("data");
  const classData = await db.collection("class_data").findOne({
    classId: classObjectId,
    teacher_id: teacherObjectId, // 소유권 체크
  });

  if (!classData) {
    return NextResponse.json({ error: "학급 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(classData);
});
