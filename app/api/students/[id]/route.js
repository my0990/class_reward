import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireTeacherOrKiosk, parseObjectId, requireActiveClass } from "@/lib/api/routeHelpers";

// 학급 학생 목록 (교사 대시보드, 키오스크, 학생 관리, 퀘스트, 번호 뽑기, 자리 바꾸기)
//
// 이 목록을 쓰는 화면들은 학생의 '가진 프로필 사진 목록(profileImgStorage)·칭호 목록(titles)·inventory'를
// 쓰지 않는다 (그건 학생 본인 화면이 /api/user로 받는다). 학생 문서에서 가장 큰 부분이라 빼고 보낸다
// → 자동 새로고침 때 DB 전송량이 줄어든다. 이 화면들에서 이 칸이 필요해지면 여기서 빼지 말 것.
const LIST_PROJECTION = { profileImgStorage: 0, titles: 0, inventory: 0 };

export const GET = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const classObjectId = parseObjectId(id, "학급 id");
  const { teacherObjectId } = await requireTeacherOrKiosk({ classId: id }); // 교사 또는 이 반 키오스크
  await requireActiveClass(teacherObjectId, classObjectId);

  const db = (await connectDB).db("data");
  const studentsData = await db
    .collection("user_data")
    .find({ teacher_id: teacherObjectId, classId: classObjectId }, { projection: LIST_PROJECTION })
    .sort({ classNumber: 1 })
    .toArray();

  return NextResponse.json(studentsData);
});
