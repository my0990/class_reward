import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?._id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let teacherObjectId;
  try {
    teacherObjectId = ObjectId.createFromHexString(session.user._id);
  } catch {
    return NextResponse.json({ error: "잘못된 세션입니다." }, { status: 400 });
  }

  const { id: userId } = await params;
  const db = (await connectDB).db("data");

  // ✅ 이 요청을 보낸 교사가 실제로 이 학생의 담임인지 확인한다.
  const owns = await db.collection("user_data").findOne({
    userId,
    teacher_id: teacherObjectId,
    role: "student",
  });

  if (!owns) {
    return NextResponse.json({ error: "조회 권한이 없습니다." }, { status: 403 });
  }

  const response = await db
    .collection("history")
    .find({ userId }, { projection: { code: 0 } })
    .sort({ date: -1 })
    .toArray();

  return NextResponse.json(response);
}
