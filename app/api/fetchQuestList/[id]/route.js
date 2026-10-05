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
    // 정렬 규칙 (README "순서 규칙" 참고)
    // - order: 교사가 드래그로 정한 순서 (0, 1, 2…)
    // - 새로 만든 퀘스트는 order가 없다 → MongoDB 오름차순 정렬에서 "없는 값"은 숫자보다 앞이라 맨 위에 나온다 (의도된 동작)
    // - order가 없는 것끼리는 최신순
    .sort({ order: 1, time: -1 })
    .toArray();

  return NextResponse.json(quests);
});
