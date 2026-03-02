import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    const { id } = await params; // ✅ /api/notices/:id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "잘못된 id" },
        { status: 400 }
      );
    }

    const client = await connectDB;
    const db = client.db("admins");

    const notice = await db
      .collection("notices")
      .findOne({ _id: new ObjectId(id) });

    if (!notice) {
      return NextResponse.json(
        { success: false, message: "공지 없음" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notice: {
        ...notice,
        _id: notice._id.toString(),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "서버 오류" },
      { status: 500 }
    );
  }
}