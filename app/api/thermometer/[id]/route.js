// // app/classes/[id]/route.js
// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { ObjectId } from "mongodb";

// export async function GET(req, {params}) {
//     const session = await getServerSession(authOptions);
//     const { id } = await params;
//     if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const teacher_id = session.user.role === 'teacher' ? session.user._id : session.user.teacher_id;
    
//     const db = (await connectDB).db("data");

//     const thermometerData = await db.collection("thermometer").findOne({
//         classId: ObjectId.createFromHexString(id),
//         teacher_id: ObjectId.createFromHexString(teacher_id) // ✅ 소유권 체크
//     });
//     if (!thermometerData) return NextResponse.json({ message: "not found" }, { status: 404 });


//     return NextResponse.json(thermometerData);
// }


// app/classes/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

const DEFAULT_THERMOMETER = {
  manualDegree: 0,        // 선생님이 직접 올린 온도
  requireCurrency: 30,   // 1도 올리는 데 필요한 화폐 수
  reward: {
    10: "",
    20: "",
    30: "",
    40: "",
    50: "",
    60: "",
    70: "",
    80: "",
    90: "",
    100: "",
  },
  donators: {}
};

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const teacher_id =
    session.user.role === "teacher"
      ? session.user._id
      : session.user.teacher_id;

  const db = (await connectDB).db("data");

  const thermometerData = await db.collection("thermometer").findOne({
    classId: ObjectId.createFromHexString(id),
    teacher_id: ObjectId.createFromHexString(teacher_id),
  });

  // DB에 데이터가 없으면 기본값 내려주기
  if (!thermometerData) {
    return NextResponse.json({
      ...DEFAULT_THERMOMETER,
      classId: id,
      teacher_id,
      isDefault: true, // 프론트에서 신규 여부 확인용 (선택)
    });
  }

  // 일부 필드만 없는 경우도 안전하게 병합
  const mergedData = {
    ...DEFAULT_THERMOMETER,
    ...thermometerData,
    reward: {
      ...DEFAULT_THERMOMETER.reward,
      ...(thermometerData.reward || {}),
    },
    donators: {
        ...DEFAULT_THERMOMETER.donators,
        ...(thermometerData.donators || {}),
      },
  };

  return NextResponse.json(mergedData);
}