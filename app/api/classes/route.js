import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const teacher_id = session.user._id;

  const db = (await connectDB).db("data")
  const classes = await db
    .collection("classes")
    .find({ teacher_id: ObjectId.createFromHexString(teacher_id) })
    .toArray();
  return NextResponse.json(classes);
}