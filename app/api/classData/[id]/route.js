// app/classes/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET(req, {params}) {
    const session = await getServerSession(authOptions);
    


    const { id } = await params;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teacher_id = session.user._id;

    const db = (await connectDB).db("data");

    const classData = await db.collection("class_data").findOne({
        classId: ObjectId.createFromHexString(id),
        teacher_id: ObjectId.createFromHexString(teacher_id) // ✅ 소유권 체크
    });

    if (!classData) return NextResponse.json({ message: "not found" }, { status: 404 });

    // token, teacherId 같은 민감 정보 제거 후 반환
    //   const { teacherId, ...safeData } = classData;

    return NextResponse.json(classData);
}