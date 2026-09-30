import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireTeacher, parseObjectId } from "@/lib/api/routeHelpers";

// 학급 학생 목록 (교사 대시보드, 키오스크)
export const GET = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const classObjectId = parseObjectId(id, "학급 id");
  const { teacherObjectId } = await requireTeacher();

  const db = (await connectDB).db("data");
  const studentsData = await db
    .collection("user_data")
    .find({ teacher_id: teacherObjectId, classId: classObjectId })
    .sort({ classNumber: 1 })
    .toArray();

  return NextResponse.json(studentsData);
});
