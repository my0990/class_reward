// app/classes/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET(req, {params}) {
    const session = await getServerSession(authOptions);
    console.log('api classData')
    console.log(session)
    const { id } = await params;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teacher_id = session.user.role === 'teacher' ? session.user._id : session.user.teacher_id;
    
    const db = (await connectDB).db("data");

    const classData = await db.collection("class_data").findOne({
        classId: ObjectId.createFromHexString(id),
        teacher_id: ObjectId.createFromHexString(teacher_id) // ✅ 소유권 체크
    });
    console.log(classData)
    if (!classData) return NextResponse.json({ message: "not found" }, { status: 404 });


    return NextResponse.json(classData);
}