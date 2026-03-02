// app/classes/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);


    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let userId = null;
    userId = session.role === "teacher" ? session.user.email : session.user.userId;
    const db = (await connectDB).db("data");

    const userData = await db.collection("user_data").findOne({
        userId: userId // ✅ 소유권 체크
    });

    if (!userData) return NextResponse.json({ message: "not found" }, { status: 404 });


    return NextResponse.json(userData);
}