import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireTeacher, parseObjectId, requireActiveClass } from "@/lib/api/routeHelpers";

// 학급 학생 목록이 바뀌었는지 알려 주는 아주 작은 값 (키오스크가 15초마다 확인)
// - 잔액·아이템이 바뀌면 거래 기록(history)이 생기므로 → 그 학급의 마지막 기록 시각
// - 학생이 추가·삭제되면 → 학생 수
// 이 값이 바뀔 때만 학생 목록 전체(/api/students/[id])를 다시 불러온다 → DB 전송량을 크게 줄임
export const GET = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const classObjectId = parseObjectId(id, "학급 id");
  const { teacherObjectId } = await requireTeacher();
  await requireActiveClass(teacherObjectId, classObjectId);

  const db = (await connectDB).db("data");
  const scope = { teacher_id: teacherObjectId, classId: classObjectId };
  const [last, count] = await Promise.all([
    db.collection("history").findOne(scope, { sort: { date: -1 }, projection: { _id: 0, date: 1 } }),
    db.collection("user_data").countDocuments(scope),
  ]);

  return NextResponse.json({ v: `${last?.date ? new Date(last.date).getTime() : 0}-${count}` });
});
