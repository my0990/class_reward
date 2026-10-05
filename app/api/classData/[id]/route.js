import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireMember, parseObjectId, requireActiveClass } from "@/lib/api/routeHelpers";

// 학생 화면이 실제로 쓰는 필드만 학생에게 준다.
// (학급 고유 별명=학생 아이디 규칙, 계정 생성 현황 같은 교사용 정보는 빼고)
const STUDENT_FIELDS = {
  classId: 1,
  className: 1,
  currencyEmoji: 1,
  currencyName: 1,
  expTable: 1,
  itemList: 1,
  profileImgStorage: 1,
  profileImgOrder: 1,
};

// 학급 설정/마켓/프로필 이미지 등 학급 정보 (교사 + 그 반 학생)
export const GET = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const classObjectId = parseObjectId(id, "학급 id");
  const { teacherObjectId, role } = await requireMember({ classId: id });
  await requireActiveClass(teacherObjectId, classObjectId);

  const db = (await connectDB).db("data");
  const classData = await db.collection("class_data").findOne(
    {
      classId: classObjectId,
      teacher_id: teacherObjectId, // 소유권 체크
    },
    role === "student" ? { projection: STUDENT_FIELDS } : undefined
  );

  if (!classData) {
    return NextResponse.json({ error: "학급 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(classData);
});
