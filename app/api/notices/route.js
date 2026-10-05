import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { parseIntParam } from "@/lib/api/routeHelpers";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // 숫자가 아니면 기본값, limit은 최대 50개로 제한 (한 번에 전체 조회 방지)
    const page = parseIntParam(searchParams.get("page"), { defaultValue: 1, min: 1, max: 10000 });
    const limit = parseIntParam(searchParams.get("limit"), { defaultValue: 5, min: 1, max: 50 });

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
      notices: notices.map((n) => ({ ...n, _id: n._id.toString() })),
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "공지 불러오기 실패" },
      { status: 500 }
    );
  }
}