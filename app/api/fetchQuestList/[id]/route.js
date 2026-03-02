import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET(req, {params}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher_id = session.user._id;

  const db = (await connectDB).db("data");

  const filter = {
    teacher_id: ObjectId.createFromHexString(teacher_id), // 또는 teacherId 필드명에 맞게 수정
    classId: ObjectId.createFromHexString(id)
  };

  const response = await db.collection('quest').find({ ...filter }, { projection: { code: 0 } }).sort({ time: '-1' }).toArray();

  return NextResponse.json(response);
}


