import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireTeacher } from "@/lib/api/routeHelpers";

// 교사의 학급 목록
export const GET = withApiHandler(async () => {
  const { teacherObjectId } = await requireTeacher();

  const db = (await connectDB).db("data");
  const classes = await db
    .collection("classes")
    .find({ teacher_id: teacherObjectId })
    .toArray();

  return NextResponse.json(classes);
});
