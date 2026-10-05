import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    const { id } = await params; // ✅ /api/notices/:id

    // isValid는 12글자 아무 문자열도 통과시켜서 24자리 hex만 허용한다.
    if (typeof id !== "string" || !/^[0-9a-f]{24}$/i.test(id)) {
      return NextResponse.json(
        { error: "잘못된 id" },
        { status: 400 }
      );
    }

    const client = await connectDB;
    const db = client.db("admins");

    const notice = await db
      .collection("notices")
      .findOne({ _id: ObjectId.createFromHexString(id) });

    if (!notice) {
      return NextResponse.json(
        { error: "공지 없음" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      notice: {
        ...notice,
        _id: notice._id.toString(),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}