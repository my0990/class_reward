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

  const studentsData = await db.collection("user_data").find(filter).sort({ classNumber: 1 }).toArray();
  console.log(studentsData)

  return NextResponse.json(studentsData);
}