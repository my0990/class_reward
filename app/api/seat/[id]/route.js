import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireTeacher, parseObjectId, requireActiveClass } from "@/lib/api/routeHelpers";

// 자리 바꾸기 정보 (교사만): 교실 배치·조건·지금 자리·지난 자리
export const GET = withApiHandler(async (req, { params }) => {
  const classObjectId = parseObjectId((await params).id, "학급 id");
  const { teacherObjectId } = await requireTeacher();
  await requireActiveClass(teacherObjectId, classObjectId);
  const doc = await (await connectDB)
    .db("data")
    .collection("class_data")
    .findOne({ teacher_id: teacherObjectId, classId: classObjectId }, { projection: { seatPlan: 1 } });
  return NextResponse.json(doc?.seatPlan ?? null);
});
