import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireTeacher, parseObjectId, requireActiveClass } from "@/lib/api/routeHelpers";

// 학급 퀘스트 목록 (교사)
export const GET = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const classObjectId = parseObjectId(id, "학급 id");
  const { teacherObjectId } = await requireTeacher();
  await requireActiveClass(teacherObjectId, classObjectId);

  const db = (await connectDB).db("data");
  const quests = await db
    .collection("quest")
    .find({ teacher_id: teacherObjectId, classId: classObjectId }, { projection: { code: 0 } })
    // 교사가 드래그로 정한 순서(order) → 없으면(새 퀘스트) 맨 위, 같으면 최신순
    .sort({ order: 1, time: -1 })
    .toArray();

  return NextResponse.json(quests);
});
