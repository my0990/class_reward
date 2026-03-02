import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.max(1, Number(searchParams.get("limit") ?? 5));

    const client = await connectDB;
    const db = client.db("admins");

    const skip = (page - 1) * limit;

    const [notices, total] = await Promise.all([
      db
        .collection("notices")
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("notices").countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      notices: notices.map((n) => ({ ...n, _id: n._id.toString() })),
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "공지 불러오기 실패" },
      { status: 500 }
    );
  }
}