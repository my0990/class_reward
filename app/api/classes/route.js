import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireTeacher } from "@/lib/api/routeHelpers";

// 교사의 학급 목록 + 학급별 학생 수
// 학생 수는 저장해 두지 않고 매번 user_data에서 센다 (계정 생성·삭제와 항상 일치).
export const GET = withApiHandler(async () => {
  const { teacherObjectId } = await requireTeacher();

  const db = (await connectDB).db("data");

  const [classes, counts] = await Promise.all([
    db.collection("classes").find({ teacher_id: teacherObjectId }).toArray(),
    db
      .collection("user_data")
      .aggregate([
        { $match: { teacher_id: teacherObjectId, role: "student" } },
        { $group: { _id: "$classId", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const countByClassId = new Map(counts.map((c) => [String(c._id), c.count]));

  return NextResponse.json(
    classes.map((cls) => ({
      ...cls,
      studentsCount: countByClassId.get(String(cls._id)) ?? 0,
    }))
  );
});
